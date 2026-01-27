# 🔐 Durcissement de la sécurité sous Linux (Ubuntu 24.04)

> **Contexte**  
> Environnement de test réalisé sur une machine virtuelle Ubuntu 24.04, avec volumes supplémentaires chiffrés.  
> Ce guide s’inscrit dans une démarche de durcissement système orientée administration, cybersécurité et bonnes pratiques.

**Auteur :** [Swapshadow](https://github.com/Swapshadow)  
**Version :** 1.1  
**Dernière mise à jour :** 12/03/2025 – 18:09  

---

## 📚 Sommaire

1. 🎯 Objectifs et périmètre  
2. 📦 Prérequis  
3. 🖥️ Environnement matériel  
4. 👤 Gestion des utilisateurs et des privilèges  
5. 🔑 Sécurisation des accès SSH  
6. 🛡️ Détection d’intrusions avec Snort  
7. 🔍 Réduction de la surface d’attaque  
8. 📋 Audit et traçabilité avec auditd  
9. 🗃️ Gestion des quotas sur volumes chiffrés  
10. ✅ Conclusion et perspectives  
11. 📌 Publication sur GitHub (où mettre le fichier)

---

## 🎯 1. Objectifs et périmètre

L’objectif de ce guide est de présenter une **base méthodologique de durcissement de sécurité** pour un système **Ubuntu 24.04**, applicable aussi bien en environnement de test que de préproduction.

Axes abordés :
- gestion des accès utilisateurs,
- sécurisation des services exposés,
- surveillance et audit du système,
- limitation de l’impact en cas de compromission.

---

## 📦 2. Prérequis

### Logiciels
- Hyperviseur : **VirtualBox**
- Image ISO : **Ubuntu Server 24.04 LTS**
- Accès administrateur (sudo)

---

## 🖥️ 3. Environnement matériel

- Machine virtuelle ou physique
- Minimum recommandé :
  - 2 vCPU
  - 4 Go de RAM
  - 20 Go disque système
  - 1 volume supplémentaire chiffré (LUKS)

---

## 👤 4. Gestion des utilisateurs et des privilèges

### 4.1 Création d’un compte administrateur limité (`subadmin`)

```bash
groupadd admin
useradd -m -d /mnt/Storage/subadmin -g admin -G sudo -s /bin/bash subadmin
id subadmin
```

Objectif : éviter l’usage direct de root et faciliter la traçabilité.

---

### 4.2 Restreindre l’utilisation de `apt` et `apt-get`

Éditer la configuration sudo :

```bash
visudo
```

```plaintext
subadmin ALL=(ALL:ALL) ALL, !/usr/bin/apt, !/usr/bin/apt-get
```

Remarque : à ajuster selon ton organisation (par exemple autoriser uniquement certains scripts ou commandes).

---

### 4.3 Forcer l’expiration du mot de passe (90 jours)

```bash
chage -M 90 subadmin
chage -l subadmin
```

---

## 🔑 5. Sécurisation des accès SSH

### 5.1 Connexion par clé uniquement

```bash
ssh-keygen -t rsa -b 4096
ssh-copy-id -i ~/.ssh/ubuntu.pub jo@192.168.1.118
```

---

### 5.2 Paramètres SSH renforcés

Éditer `/etc/ssh/sshd_config` :

```plaintext
Port 53142
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
MaxSessions 2
ClientAliveInterval 600
ClientAliveCountMax 0
```

Appliquer :

```bash
systemctl restart ssh
```

---

### 5.3 Modifier le port SSH via `systemd`

```bash
systemctl edit ssh.socket
```

```ini
[Socket]
ListenStream=
ListenStream=53142
Accept=yes
FreeBind=yes
```

Appliquer :

```bash
systemctl daemon-reexec
systemctl restart ssh.socket
ss -tlnp | grep ssh
```

---

### 5.4 Restreindre SSH à une adresse IP (optionnel)

Récupérer l’IP locale :

```bash
hostname -I | awk '{print $1}'
```

Dans `/etc/ssh/sshd_config` :

```plaintext
ListenAddress TON_IP_ACTUELLE
```

Puis :

```bash
systemctl restart ssh
```

---

### 5.5 Pare-feu UFW

```bash
ufw allow 53142/tcp
ufw delete allow 22/tcp
ufw enable
ufw status numbered
```

---

## 🛡️ 6. Détection d’intrusions avec Snort

### 6.1 Installation

```bash
apt update && apt install -y snort
snort --version
```

---

### 6.2 Configuration de base

Éditer `/etc/snort/snort.conf` :

```plaintext
ipvar HOME_NET 192.168.1.0/24
```

Tester :

```bash
snort -T -i enp0s3 -c /etc/snort/snort.conf
```

---

### 6.3 Règle locale (détection ping ICMP)

Dans `/etc/snort/rules/local.rules` :

```plaintext
alert icmp any any -> $HOME_NET any (msg:"[ALERT] ICMP détecté"; sid:1000001; rev:1;)
```

Vérifier dans `/etc/snort/snort.conf` :

```plaintext
include $RULE_PATH/local.rules
```

Test :

```bash
snort -A console -i enp0s3 -c /etc/snort/snort.conf
# depuis une autre machine :
ping 192.168.1.118
```

---

## 🔍 7. Réduction de la surface d’attaque

### 7.1 Désactiver les services inutiles

Lister :

```bash
systemctl list-units --type=service --no-pager
```

Exemple :

```bash
systemctl stop vsftpd && systemctl disable --now vsftpd
systemctl mask vsftpd
```

Adapter selon tes besoins (exemples : `smbd`, `cups`, `avahi-daemon`, etc.).

Vérifier :

```bash
systemctl is-enabled cups
systemctl list-unit-files --type=service | grep disabled
```

---

## 📋 8. Audit et traçabilité avec `auditd`

### 8.1 Installation

```bash
apt install -y auditd audispd-plugins
systemctl enable --now auditd
```

---

### 8.2 Surveiller des fichiers critiques

```bash
auditctl -w /etc/shadow -p wa -k shadow_changes
auditctl -w /etc/passwd -p wa -k passwd_changes
auditctl -w /etc/ssh/sshd_config -p wa -k ssh_config
```

Lister :

```bash
auditctl -l
```

---

## 🗃️ 9. Gestion des quotas sur volume chiffré

### 9.1 Installation et activation

```bash
apt install -y quota
nano /etc/fstab
```

Ajouter `usrquota,grpquota` à l’entrée du volume concerné.

Activer :

```bash
quotacheck -F vfsv0 -ugm /mnt/External/Storage
quotaon -v /mnt/External/Storage
```

---

### 9.2 Définir des quotas utilisateurs

```bash
edquota subadmin
repquota -a
quota -u subadmin
```

---

## ✅ 10. Conclusion et perspectives

Ce guide fournit une base solide de durcissement Linux sur Ubuntu 24.04 :

* renforcement des accès (utilisateurs / SSH),
* détection et surveillance (Snort / auditd),
* réduction de la surface d’attaque,
* contrôle des ressources (quotas) sur volumes chiffrés.
