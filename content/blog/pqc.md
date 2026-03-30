# 🔐 RSA, c’est la fin ? Place à la cryptographie post-quantique

## 🧠 L’informatique quantique arrive à grands pas

Depuis plusieurs années, les géants technologiques comme Google, IBM ou Microsoft investissent massivement dans l’informatique quantique.

👉 Objectif : construire des machines capables de résoudre certains problèmes **exponentiellement plus rapidement** que les ordinateurs classiques.

### ⚠️ Problème

Les algorithmes actuels comme :

- RSA
- ECDSA
- ECDHE

reposent sur des problèmes mathématiques (factorisation, logarithme discret)
👉 **cassables avec un ordinateur quantique suffisamment puissant** (algorithme de Shor).

### 📅 Timeline réaliste

- 2023–2025 → premières démonstrations concrètes
- 2030+ → ordinateurs quantiques potentiellement capables d’attaques réelles

👉 On parle de **"Harvest Now, Decrypt Later"** :
des attaquants peuvent déjà stocker du trafic chiffré aujourd’hui pour le casser demain.

---

## 🏛️ Le concours PQC du NIST

Pour anticiper cette menace, le NIST a lancé en **2016** un concours mondial de cryptographie post-quantique.

### 🎯 Objectif

Trouver des algorithmes résistants aux attaques quantiques.

### 🏆 Résultats (2022–2024)

#### 🔑 Échange de clé (KEM)

- **Kyber → ML-KEM (standardisé)**

#### ✍️ Signature

- **Dilithium → ML-DSA**
- Falcon
- SPHINCS+

👉 Kyber (ML-KEM) est aujourd’hui **le standard principal pour TLS PQC**.

---

## 🌍 Adoption actuelle

Même si le PQC est encore récent, plusieurs acteurs l’utilisent déjà :

- Cloudflare → TLS hybride (classique + PQC)
- Google → Chrome + expérimentations TLS PQC
- Signal → protection des échanges avec PQC

👉 Approche actuelle :
**Hybride = sécurité classique + post-quantique**

---

## ⚠️ Pourquoi le PQC n’est pas encore partout ?

Aujourd’hui, déployer du PQC en production reste complexe :

- ❌ Standards encore récents
- ❌ Compatibilité limitée (navigateurs, serveurs)
- ❌ Impact performance (clés plus grosses)
- ❌ Infrastructure non prête

👉 Conclusion :

> Le PQC est prêt… mais l’écosystème ne l’est pas encore totalement.

---

## 🧪 Tester le PQC avec OpenSSL 3.5

Bonne nouvelle :
👉 **OpenSSL 3.5 permet d’utiliser ML-KEM (Kyber)**

### 🔧 Installation

Repo officiel :
👉 [https://github.com/openssl/openssl](https://github.com/openssl/openssl)

Compilation classique :

```bash
git clone https://github.com/openssl/openssl.git
cd openssl
git checkout openssl-3.5.0

./Configure
make -j$(nproc)
sudo make install
```

---

## 🔑 Exemple : TLS 1.3 avec Kyber (ML-KEM)

### 1️⃣ Générer un certificat

```bash
openssl req -x509 -newkey rsa:2048 \
-keyout server-key.pem \
-out server-cert.pem \
-days 1 -nodes \
-subj "/CN=localhost"
```

---

### 2️⃣ Lancer un serveur TLS PQC

```bash
openssl s_server -tls1_3 -accept 4433 \
-cert server-cert.pem \
-key server-key.pem \
-groups MLKEM768
```

---

### 3️⃣ Connexion client

```bash
openssl s_client -tls1_3 \
-connect 127.0.0.1:4433 \
-groups MLKEM768
```

---

### 🔍 Résultat attendu

```text
Negotiated TLS1.3 group: MLKEM768
```

👉 Cela signifie :

- échange de clé **post-quantique réussi**
- session TLS sécurisée contre un attaquant quantique

---

## 🧠 Ce qu’il faut retenir

👉 ML-KEM (Kyber) remplace ECDHE pour l’échange de clé  
👉 AES reste utilisé pour chiffrer les données  
👉 Le futur sera **hybride puis 100% post-quantique**

---

## 🚀 Conclusion

La cryptographie actuelle n’est pas encore morte…
mais elle est déjà condamnée à long terme.

👉 Le PQC n’est plus une théorie  
👉 c’est une transition en cours

> Les entreprises qui anticipent aujourd’hui auront un avantage stratégique demain.
