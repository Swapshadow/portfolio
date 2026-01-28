# Sécurisation Windows Server 2025

> **Environnement :** VM Windows Server 2025 (Hyper-V)
> **Auteur :** [Swapshadow](https://github.com/Squalu) — **Version :** 1.1 — **Dernière mise à jour :** *13/03/2025 16:38*

---

## Sommaire

* [Objectif et périmètre](#objectif-et-périmètre)
* [Prérequis](#prérequis)
* [Matériel requis](#matériel-requis)
* [1. BitLocker](#1-bitlocker)
  * [1.1 Activer le TPM virtuel (Hyper-V)](#11-activer-le-tpm-virtuel-hyper-v)
  * [1.2 Installer la fonctionnalité BitLocker](#12-installer-la-fonctionnalité-bitlocker)
  * [1.3 Activer le chiffrement et gérer la clé](#13-activer-le-chiffrement-et-gérer-la-clé)
* [2. Comptes et stratégies locales](#2-comptes-et-stratégies-locales)
  * [2.1 Compte admin secondaire + désactivation de l’admin par défaut](#21-compte-admin-secondaire--désactivation-de-ladmin-par-défaut)
  * [2.2 Politique de mots de passe](#22-politique-de-mots-de-passe)
  * [2.3 Verrouillage de compte](#23-verrouillage-de-compte)
* [3. Permissions et contrôle d’accès](#3-permissions-et-contrôle-daccès)
  * [3.1 Autorisations NTFS](#31-autorisations-ntfs)
  * [3.2 Restriction logicielle](#32-restriction-logicielle)
  * [3.3 Pare-feu Windows (WFAS)](#33-pare-feu-windows-wfas)
* [4. Sécurisation du Bureau à Distance (RDP)](#4-sécurisation-du-bureau-à-distance-rdp)
  * [4.1 Changer le port RDP](#41-changer-le-port-rdp)
  * [4.2 Restreindre l’accès RDP (utilisateurs + IP)](#42-restreindre-laccès-rdp-utilisateurs--ip)
* [5. Audit et surveillance](#5-audit-et-surveillance)
  * [5.1 Activer l’audit des connexions](#51-activer-laudit-des-connexions)
  * [5.2 Alertes (Event Viewer + tâches)](#52-alertes-event-viewer--tâches)
* [6. Durcissement avancé](#6-durcissement-avancé)
  * [6.1 Désactiver les services non nécessaires](#61-désactiver-les-services-non-nécessaires)
* [Références](#références)

---

## Objectif et périmètre

Ce guide rassemble des mesures **concrètes et vérifiables** pour durcir un **Windows Server 2025** (standalone ou en maquette).
Le focus : **protéger l’accès**, **réduire la surface d’attaque**, **chiffrer**, **contrôler**, **journaliser**.

> Remarque : si le serveur rejoint un domaine, privilégie des **GPO de domaine** (ou une baseline) plutôt que la stratégie locale.

---

## Prérequis

* Hyper-V activé sur Windows 11
* ISO d’installation Windows Server 2025

## Matériel requis

* Une machine virtuelle ou physique sous Windows Server 2025
* Un compte administrateur
* Un client Windows 10/11 (VM ou machine physique) pour tester certaines configurations

---

## 1. BitLocker

### 1.1 Activer le TPM virtuel (Hyper-V)

1. Ouvrir **Hyper-V Manager**
2. Sélectionner la **VM**
3. Clic droit → **Paramètres**
4. Aller dans **Sécurité**
5. Cocher : **Activer le module de plateforme sécurisée (TPM)**

![Activation du TPM virtuel dans Hyper-V](https://files.cryptpad.fr/blob/42/42797c5a44a5fb1c53dfac2704a7de2de8b04a6d87230f83)

6. Vérifier aussi : **Démarrage sécurisé (Secure Boot)** activé et réglé sur **Microsoft Windows**

> Point d’attention : sans TPM (ou équivalent), BitLocker peut fonctionner mais la gestion des clés et le niveau de protection changent. Sur une VM, vise TPM + Secure Boot.

---

### 1.2 Installer la fonctionnalité BitLocker

1. Ouvrir **Gestionnaire de serveur**
2. **Gérer** → **Ajouter des rôles et fonctionnalités**
3. Type : **Installation basée sur un rôle ou une fonctionnalité**
4. Sélectionner le serveur cible
5. Dans **Fonctionnalités**, cocher : **Chiffrement de lecteur BitLocker**
6. Ajouter les utilitaires si demandé (**BitLocker Drive Encryption Administration Utilities**)
7. **Installer** puis redémarrer si nécessaire

---

### 1.3 Activer le chiffrement et gérer la clé

1. Ouvrir l’Explorateur de fichiers
2. Clic droit sur le volume → **Activer BitLocker**
3. Suivre l’assistant
4. **Sauvegarder la clé de récupération** dans un emplacement réellement sûr

> Bonnes pratiques clés :
>
> * Stocker la clé **hors du serveur** (coffre-fort, support chiffré, stockage admin dédié, etc.).
> * Documenter *où* se trouve la clé et *qui* peut y accéder (contrôle d’accès).

---

## 2. Comptes et stratégies locales

### 2.1 Compte admin secondaire + désactivation de l’admin par défaut

1. Ouvrir `lusrmgr.msc` (Utilisateurs et groupes locaux)
2. Créer un **nouvel utilisateur**
3. L’ajouter au groupe **Administrateurs**
4. Désactiver le compte **Administrateur** par défaut (propriétés du compte)

> Recommandation : utiliser un compte admin nominatif (traçabilité), et garder un compte “break-glass” très verrouillé, documenté, avec accès limité.

---

### 2.2 Politique de mots de passe

1. Ouvrir `gpedit.msc`
2. Chemin :

   ```plaintext
   Configuration ordinateur > Paramètres Windows > Paramètres de sécurité
   > Stratégies de compte > Stratégie de mot de passe
   ```

3. Valeurs recommandées :

| Paramètre                       | Recommandation                     |
| ------------------------------- | ---------------------------------- |
| Exiger un mot de passe complexe | Activé                             |
| Longueur minimale               | 12 caractères (minimum)            |
| Durée de vie maximale           | 90 jours (selon politique interne) |
| Durée de vie minimale           | 1 jour                             |
| Historique                      | 10 mots de passe                   |

4. Appliquer puis forcer :

```powershell
gpupdate /force
```

---

### 2.3 Verrouillage de compte

Ressource utile : [Politique de mot de passe / bonnes pratiques (ANSSI)](https://www.it-connect.fr/politique-de-mot-de-passe-comment-appliquer-les-bonnes-pratiques-de-lanssi/)

1. Ouvrir `gpedit.msc`
2. Chemin :

   ```plaintext
   Configuration ordinateur > Paramètres Windows > Paramètres de sécurité
   > Stratégies de compte > Stratégie de verrouillage de compte
   ```

3. Valeurs recommandées :

| Paramètre                    | Recommandation |
| ---------------------------- | -------------- |
| Seuil de verrouillage        | 5 tentatives   |
| Durée de verrouillage        | 15 minutes     |
| Réinitialisation du compteur | 15 minutes     |

4. Appliquer :

```powershell
gpupdate /force
```

---

## 3. Permissions et contrôle d’accès

### 3.1 Autorisations NTFS

1. Créer un dossier, ex. `C:\Partage`
2. Clic droit → **Propriétés** → **Sécurité** → **Modifier**
3. Ajouter uniquement les groupes/utilisateurs nécessaires
4. Appliquer le **principe du moindre privilège** :
   * lecture seule si possible
   * écriture uniquement si nécessaire
5. Tester depuis un autre compte

> Astuce : préfère des **groupes** (ex. `GRP_Partage_RW`) plutôt que des utilisateurs directement.

---

### 3.2 Restriction logicielle

1. Ouvrir `gpedit.msc`
2. Chemin :

   ```plaintext
   Configuration ordinateur > Paramètres Windows > Paramètres de sécurité
   > Stratégies de restriction logicielle
   ```

3. Exemple de règle :

   * Type : **Règle de chemin d'accès**
   * Chemin : `C:\Users\*\Downloads`
   * Niveau : **Non autorisé**

Répertoires souvent ciblés :

* `%TEMP%`
* `%APPDATA%`
* `Téléchargements`

> Remarque : selon les besoins, une approche plus moderne peut être **AppLocker** (si disponible/pertinent) pour des règles plus granulaires.

---

### 3.3 Pare-feu Windows (WFAS)

Objectif : bloquer les **pings entrants** (ICMP Echo Request).

1. Ouvrir `wf.msc`
2. **Règles de trafic entrant** → **Nouvelle règle**
3. Type : **Personnalisée**
4. Protocole : **ICMPv4** → personnaliser → **Demandes d’écho**
5. Action : **Bloquer la connexion**
6. Profils : Domaine / Privé / Public
7. Nom : `Bloquer Ping (ICMP Echo Request)`

![Création d'une règle ICMP dans le pare-feu Windows](https://files.cryptpad.fr/blob/b4/b41145b1f4500a0cedf8a6f64cf6680a75f554c8047ad79a)

Test :

```plaintext
ping IP_du_serveur
```

---

## 4. Sécurisation du Bureau à Distance (RDP)

> Important : changer le port **n’est pas une mesure de sécurité suffisante** à elle seule. Ça réduit le bruit automatisé, mais la vraie sécurité vient de : restriction IP, NLA, comptes, MFA/contrôle d’accès, supervision.

### 4.1 Changer le port RDP

1. Ouvrir `regedit`
2. Chemin :

   ```plaintext
   HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp
   ```

3. Modifier `PortNumber` (DWORD) ex. `53535`
4. Redémarrer le service :

   ```powershell
   Restart-Service -Name TermService -Force
   ```

5. Créer/adapter la règle pare-feu pour autoriser **le nouveau port**

Test :

```plaintext
mstsc /v:IP_du_serveur:Nouveau_Port
```

---

### 4.2 Restreindre l’accès RDP (utilisateurs + IP)

#### Limiter les utilisateurs autorisés

1. Ouvrir `gpedit.msc`
2. Chemin :

   ```plaintext
   Configuration ordinateur > Modèles d’administration > Composants Windows
   > Services Bureau à distance > Hôtes de session Bureau à distance > Connexions
   ```

3. Définir/limiter les utilisateurs autorisés à se connecter à distance
4. Appliquer :

   ```powershell
   gpupdate /force
   ```

#### Limiter l’accès par IP (pare-feu)

1. Ouvrir `wf.msc`
2. Éditer la règle RDP → onglet **Étendue**
3. Renseigner **Adresses IP distantes** autorisées (ex. `192.168.1.10` ou `192.168.1.0/24`)

---

## 5. Audit et surveillance

### 5.1 Activer l’audit des connexions

1. Ouvrir `gpedit.msc`
2. Chemin :

   ```plaintext
   Configuration ordinateur > Paramètres Windows > Paramètres de sécurité
   > Stratégies locales > Stratégie d’audit
   ```

3. Activer :

   * **Succès et échecs** : *Audit des ouvertures de session*
   * **Succès et échecs** : *Audit des tentatives d’ouverture de session*

4. Appliquer :

   ```powershell
   gpupdate /force
   ```

Vérification dans `eventvwr.msc` → **Journaux Windows > Sécurité** :

* **4624** : connexion réussie
* **4625** : échec de connexion

---

### 5.2 Alertes (Event Viewer + tâches)

#### Alerte sur connexions administrateur (exemple)

1. Ouvrir `eventvwr.msc`
2. **Journaux Windows > Sécurité**
3. Filtrer un événement (ex. **4624**) puis **Joindre une tâche à cet événement**

![Association d'une tâche à un événement dans l'Event Viewer](https://files.cryptpad.fr/blob/65/65a3186001e713ec354acf41e8473874bd67c6fa1df2b7b0)

Script exemple (`send_alert.ps1`) :

```powershell
$EmailTo = "admin@example.com"
$EmailFrom = "serveur@example.com"
$Subject = "Alerte connexion administrateur"
$Body = "Un administrateur s'est connecté au serveur à $(Get-Date)."
$SmtpServer = "smtp.example.com"

Send-MailMessage -From $EmailFrom -To $EmailTo -Subject $Subject -Body $Body -SmtpServer $SmtpServer
```

#### Alerte sur échecs répétés (exemple)

Script (`send_fail_alert.ps1`) :

```powershell
$EmailTo = "admin@example.com"
$EmailFrom = "serveur@example.com"
$Subject = "Alerte : Échecs répétés de connexion"
$Body = "Multiples échecs de connexion détectés à $(Get-Date). Veuillez vérifier immédiatement le serveur."
$SmtpServer = "smtp.example.com"

$Fails = Get-WinEvent -LogName Security -InstanceId 4625 -After (Get-Date).AddMinutes(-10)
if ($Fails.Count -ge 5) {
    Send-MailMessage -From $EmailFrom -To $EmailTo -Subject $Subject -Body $Body -SmtpServer $SmtpServer
}
```

> Conseil : en environnement pro, centraliser les logs (SIEM / collecteur) et déclencher des alertes côté plateforme plutôt que localement.

---

## 6. Durcissement avancé

### 6.1 Désactiver les services non nécessaires

1. Ouvrir `services.msc`
2. Identifier les services non requis **dans ton contexte**
3. Exemples souvent désactivables (selon usage) :
   * **Fax**
   * **Print Spooler** (si aucun besoin d’impression)
   * **Remote Registry** (réduit l’exposition)
   * **Windows Search** (souvent inutile hors serveur de fichiers)
   * **Bluetooth Support Service** (si matériel absent)

4. Désactiver proprement :
   * Type de démarrage : **Désactivé**
   * **Arrêter** le service
5. Redémarrer et valider le fonctionnement

Commande utile (vue rapide des services) :

```powershell
Get-Service | Sort-Object Status, Name
```

> Attention : ne pas “optimiser” à l’aveugle. Chaque désactivation doit être justifiée et testée.

---

## Références

* [Documentation Microsoft BitLocker (Windows Server)](https://learn.microsoft.com/fr-fr/windows/security/operating-system-security/data-protection/bitlocker/install-server)
* [Recommandations CNIL sur les mots de passe](https://www.cnil.fr/fr/mots-de-passe-une-nouvelle-recommandation-pour-maitriser-sa-securite)
* [AD et verrouillage des comptes](https://www.it-connect.fr/tuto-active-directory-et-le-verrouillage-des-comptes/)

---

Si tu veux, je peux aussi te fournir une petite section “Checklist de validation” (10–15 points) à coller en fin d’article pour vérifier rapidement que tout est en place.
