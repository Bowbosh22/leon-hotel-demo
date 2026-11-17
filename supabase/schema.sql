-- =====================================================================
-- Léon Hotel — plateforme d'avis : base de données (Supabase / PostgreSQL)
-- À coller UNE FOIS dans Supabase > SQL Editor > New query > Run.
-- =====================================================================

-- 1) Table des avis ---------------------------------------------------
create table if not exists public.reviews (
  id           text primary key,
  created_at   timestamptz not null default now(),
  service      text not null check (service in ('hebergement','restaurant','patisserie','fastfood')),
  lieu         text check (lieu is null or char_length(lieu) <= 40),
  note         int  not null check (note between 1 and 5),
  details      jsonb not null default '{}'::jsonb,
  comment      text check (comment is null or char_length(comment) <= 1000),
  lang         text not null default 'fr' check (lang in ('fr','en')),
  prenom       text check (prenom is null or char_length(prenom) <= 60),
  nom          text check (nom    is null or char_length(nom)    <= 60),
  tel          text check (tel    is null or char_length(tel)    <= 30),
  email        text check (email  is null or char_length(email)  <= 120),
  recontact    boolean not null default false,
  statut       text not null default 'Nouveau' check (statut in ('Nouveau','En cours','Traité','Clos')),
  historique   jsonb not null default '[]'::jsonb,
  note_interne text check (note_interne is null or char_length(note_interne) <= 500)
);
create index if not exists reviews_created_idx on public.reviews (created_at desc);

-- 2) Personnel autorisé (qui a accès à l'espace direction) ------------
create table if not exists public.staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role    text not null check (role in ('direction','reception'))
);

-- 3) Sécurité : RLS -----------------------------------------------------
alter table public.reviews enable row level security;
alter table public.staff   enable row level security;

-- droits de base : on retire tout, puis on donne le strict nécessaire
revoke all on public.reviews from anon, authenticated;
revoke all on public.staff   from anon, authenticated;
grant insert on public.reviews to anon, authenticated;                 -- les clients peuvent déposer un avis
grant select on public.reviews to authenticated;                       -- le personnel lit
grant update (statut, note_interne, historique) on public.reviews to authenticated; -- le personnel traite les réclamations
grant delete on public.reviews to authenticated;                       -- limité à la direction par la règle ci-dessous
grant select on public.staff to authenticated;

drop policy if exists "clients: déposer un avis" on public.reviews;
create policy "clients: déposer un avis" on public.reviews
  for insert to anon, authenticated
  with check (statut = 'Nouveau' and historique = '[]'::jsonb and note_interne is null);

drop policy if exists "personnel: lire les avis" on public.reviews;
create policy "personnel: lire les avis" on public.reviews
  for select to authenticated
  using (exists (select 1 from public.staff s where s.user_id = auth.uid()));

drop policy if exists "personnel: traiter les avis" on public.reviews;
create policy "personnel: traiter les avis" on public.reviews
  for update to authenticated
  using      (exists (select 1 from public.staff s where s.user_id = auth.uid()))
  with check (exists (select 1 from public.staff s where s.user_id = auth.uid()));

drop policy if exists "direction: supprimer" on public.reviews;
create policy "direction: supprimer" on public.reviews
  for delete to authenticated
  using (exists (select 1 from public.staff s where s.user_id = auth.uid() and s.role = 'direction'));

drop policy if exists "chacun voit sa propre fiche" on public.staff;
create policy "chacun voit sa propre fiche" on public.staff
  for select to authenticated using (user_id = auth.uid());

-- 4) Protection contre les abus : pas plus de 20 avis par minute ------
create or replace function public.limit_reviews() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.reviews where created_at > now() - interval '1 minute') >= 20 then
    raise exception 'Trop de demandes, réessayez dans une minute.';
  end if;
  return new;
end $$;
drop trigger if exists trg_limit_reviews on public.reviews;
create trigger trg_limit_reviews before insert on public.reviews
  for each row execute function public.limit_reviews();

-- 5) Petit test de vie (utilisé pour garder le projet éveillé) --------
create or replace function public.ping() returns text
language sql security definer set search_path = public as $$ select 'ok'::text $$;
revoke all on function public.ping() from public;
grant execute on function public.ping() to anon, authenticated;

-- 6) Comptes du personnel ------------------------------------------------
-- a) Créez les comptes dans Authentication > Users > Add user (e-mail + mot de passe, cochez "Auto Confirm User").
-- b) Puis exécutez (en remplaçant les e-mails) :
--
-- insert into public.staff (user_id, role)
-- select id, 'direction' from auth.users where email = 'directeur@exemple.com';
-- insert into public.staff (user_id, role)
-- select id, 'reception' from auth.users where email in ('reception1@exemple.com','reception2@exemple.com');
