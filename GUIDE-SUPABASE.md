# Étape 7 – Mise en ligne de test (Supabase gratuit, 3 utilisateurs)

1. supabase.com → New project (région proche, ex. Frankfurt/Paris). Noter le mot de passe de la base.
2. SQL Editor → coller tout le contenu de `supabase/schema.sql` → Run.
3. Authentication → Users → Add user (cocher Auto Confirm) ×3 : 1 direction + 2 réception.
4. SQL Editor, pour chaque personne :
   - direction : `insert into public.staff select id,'direction' from auth.users where email='EMAIL';`
   - réception : `insert into public.staff select id,'reception' from auth.users where email='EMAIL';`
5. Project Settings → API : copier « Project URL » et la clé « anon public ».
6. Dans `config.js`, coller les deux valeurs entre les guillemets. Publier sur GitHub.
7. Ouvrir `diagnostic.html` sur le site, saisir l'e-mail/mot de passe direction → tout doit être ✓ → m'envoyer la capture.

Plan gratuit : pause après 7 jours sans activité (le workflow GitHub `keepalive` l'évite), pas de sauvegarde automatique → export CSV chaque semaine.
