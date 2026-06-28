SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict bt1IMpeRW6C1hmUnbE8DKYdrdnBEgAnITa2BsiDWG1W54nTT2NWyWtHJrQK70tn

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at", "invite_token", "referrer", "oauth_client_state_id", "linking_target_id", "email_optional") VALUES
	('0d72f4af-2c43-4bd8-acf4-96b68da1bd34', NULL, '39fb06d2-d713-4034-802f-63a5a3cabbf6', 's256', 'yVYKn2I4J1LCrBqR_JtzyPTGt_PGyMQZF_aR90KbzqY', 'google', '', '', '2026-06-01 06:30:40.626915+00', '2026-06-01 06:30:40.626915+00', 'oauth', NULL, NULL, 'http://localhost:3001/auth/callback', NULL, NULL, false),
	('3d69a466-e01a-4199-8476-b955e2fda4b0', NULL, 'ef730354-6bdc-4f2c-bd08-e5065196b83b', 's256', 'K5-TlMwHskZ0RWDyPCiqp4nnbV6Mt_QZBC7YR_zXh1o', 'google', '', '', '2026-06-01 06:55:48.404511+00', '2026-06-01 06:55:48.404511+00', 'oauth', NULL, NULL, 'http://localhost:3001/auth/callback', NULL, NULL, false),
	('a617a678-10f8-4e65-a77f-3866e15d4096', NULL, '374afcd7-5fb0-4190-ab62-ebbf77e961d0', 's256', 'QkXz4XO_JUW0dA6GQhIZo1aDok1ELmvbie7Cea004P4', 'google', '', '', '2026-06-01 08:25:40.099349+00', '2026-06-01 08:25:40.099349+00', 'oauth', NULL, NULL, 'http://localhost:3001/auth/callback', NULL, NULL, false),
	('5a14ce5d-eb6e-430b-8c44-cce5d9d91196', NULL, 'c4847b10-42e9-4ef7-8621-b5ebf4f51a7b', 's256', 'mJyO96-dHrPB95tXoBwEXpFXy-U-Bgsm-IIlwWywygg', 'google', '', '', '2026-06-01 08:27:54.843264+00', '2026-06-01 08:27:54.843264+00', 'oauth', NULL, NULL, 'http://localhost:3001/auth/callback', NULL, NULL, false),
	('436969c1-ecae-4ba6-8e52-bf13565a9291', NULL, '2647afac-cf2c-45d7-8788-7158d09b4e25', 's256', 'dYoEy3B6dcUMQcUw8-tiDO0yLVTYjUwKoeGcnnwIeSk', 'google', '', '', '2026-06-02 06:20:13.216953+00', '2026-06-02 06:20:13.216953+00', 'oauth', NULL, NULL, 'http://localhost:3001/auth/callback', NULL, NULL, false),
	('0825f564-f3dc-478e-8eb0-72a66520f64c', NULL, '6f449979-5e77-461f-a8fd-a9bcc6c262d0', 's256', '1WMtasrz8reBXwgfKF3Sn-UDxqMcXjBCVrXAk0VRhiM', 'google', '', '', '2026-06-08 12:57:42.555777+00', '2026-06-08 12:57:42.555777+00', 'oauth', NULL, NULL, 'http://localhost:3001/auth/callback', NULL, NULL, false),
	('93af0104-1b8a-4b17-a383-bf5def248d1f', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', '848f5d52-5e1c-4a8b-a0ae-c2913907450b', 's256', 'nB8XnfJ5KSiQt0JNk82aED-6vy1U_RsZrmY8gpn6lQw', 'google', 'ya29.a0AT3oNZ85vcXrWzmVG5PTDZljo51zIYYeVYHn-lwLy6yoeYS9Qnk5mWwidORD49VSrBioDTl_IAM3FonWxUXeD0Pml-x9JMq7IqVwqlXSLchH7fQPIxOMW6uVayDx8GhovAJTguk_3kcp9JICPcdY2p8gFIyVN2LiMnY09cYxjZnyC95KV5drFb8tjfaSS4maBBoVLlsaCgYKASoSAQ4SFQHGX2MiQ7fOvGV3bxk85jOwOtezOg0206', '1//09bZlJE5TFhiOCgYIARAAGAkSNwF-L9Ire1SGqS4QN2tzPaO6JhPXzrk5FqJW6JWfrsvHDC0c7W5EOZR4dD7-sCYLeOkWQPTDyjE', '2026-06-27 14:11:19.98675+00', '2026-06-27 14:11:30.133107+00', 'oauth', '2026-06-27 14:11:30.133045+00', NULL, 'http://localhost:3001/auth/callback', NULL, NULL, false);


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '667097ba-a6f4-4935-968c-51723217c07a', 'authenticated', 'authenticated', 'chioma.nwachukwu@seed.roomie.ng', '$2a$10$wiYNFr6/lE4xtZqgxN4qbeZ8g0txyGT.rPIH2mWqLuAajBmFGeHGi', '2026-06-02 11:24:29.966576+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Chioma Nwachukwu", "avatar_url": "https://i.pravatar.cc/150?img=17", "email_verified": true}', NULL, '2026-06-02 11:24:29.961421+00', '2026-06-02 11:24:29.96726+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '81ea0d77-218a-4038-8b7c-170029dc487e', 'authenticated', 'authenticated', 'fatimah.bello@seed.roomie.ng', '$2a$10$AoAcAUnuwrRhkGp7SLflUOcK.OQNSvTayXXFygLkT6j/ibPFqDapS', '2026-06-02 11:24:09.50152+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-06-02 17:14:52.289607+00', '{"provider": "email", "providers": ["email"]}', '{"full_name": "Fatimah Bello", "avatar_url": "https://i.pravatar.cc/150?img=5", "email_verified": true}', NULL, '2026-06-02 11:24:09.490538+00', '2026-06-14 16:10:38.478489+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '349afa75-1705-4f99-b6c3-13e7e9540e25', 'authenticated', 'authenticated', 'chidi.eze@seed.roomie.ng', '$2a$10$CxBp8JikE82Lw2fl2Wuofe8tUyTkNdWE9nhbiRneAH.p9.GMRDLfS', '2026-06-02 11:24:12.624696+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Chidi Eze", "avatar_url": "https://i.pravatar.cc/150?img=7", "email_verified": true}', NULL, '2026-06-02 11:24:12.621815+00', '2026-06-02 11:24:12.625497+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', 'authenticated', 'authenticated', 'bn.usmann22@gmail.com', NULL, '2026-05-31 20:03:30.459461+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-06-27 14:21:09.54464+00', '{"provider": "google", "providers": ["google"]}', '{"iss": "https://accounts.google.com", "sub": "114330009187650815089", "name": "Bn Usmann", "email": "bn.usmann22@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocJ0QnKP8-p8Vhqy9Ki4p1IHuMhVard96lnTdcvLAOApKz_TxZcv=s96-c", "full_name": "Bn Usmann", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocJ0QnKP8-p8Vhqy9Ki4p1IHuMhVard96lnTdcvLAOApKz_TxZcv=s96-c", "provider_id": "114330009187650815089", "email_verified": true, "phone_verified": false}', NULL, '2026-05-31 20:03:30.423304+00', '2026-06-27 14:21:09.562798+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '195862f2-7212-44e3-b908-0b3055debfdf', 'authenticated', 'authenticated', 'adaeze.okoro@seed.roomie.ng', '$2a$10$6iXNkTQQYhNlr9maTkmNzeNxcUf3RSGq6wFfgZQIG2YMSBvQxfgde', '2026-06-02 11:24:23.953017+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Adaeze Okoro", "avatar_url": "https://i.pravatar.cc/150?img=13", "email_verified": true}', NULL, '2026-06-02 11:24:23.949285+00', '2026-06-02 11:24:23.95362+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '188b2eb1-0f1b-4577-a514-8dc12fa05d78', 'authenticated', 'authenticated', 'emeka.nwosu@seed.roomie.ng', '$2a$10$q1LyU4c6z8npXc1CzPye3uRwatef4GBw.aTNc7EI8/y2CKVLr.fKK', '2026-06-02 11:24:06.332709+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Emeka Nwosu", "avatar_url": "https://i.pravatar.cc/150?img=3", "email_verified": true}', NULL, '2026-06-02 11:24:06.317322+00', '2026-06-02 11:24:06.335368+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'da6f71c1-4707-401f-a932-6db6e8c18928', 'authenticated', 'authenticated', 'uche.obiechina@seed.roomie.ng', '$2a$10$s8zlBsv8DKoTxuapRC6slOXx1JNQAgi..GtSYMvPjyn9l50ZMtJVu', '2026-06-02 11:24:39.211436+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Uche Obiechina", "avatar_url": "https://i.pravatar.cc/150?img=23", "email_verified": true}', NULL, '2026-06-02 11:24:39.20848+00', '2026-06-02 11:24:39.212123+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '493f92ff-fa12-4ef5-9b43-f5e48575b395', 'authenticated', 'authenticated', 'ngozi.adeyemi@seed.roomie.ng', '$2a$10$Ed4w3RhlK2dZYZI/UiMN8umMdxcXgFx7vICh6Kn4a0aKyPvyq/lmO', '2026-06-02 11:24:17.29931+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Ngozi Adeyemi", "avatar_url": "https://i.pravatar.cc/150?img=9", "email_verified": true}', NULL, '2026-06-02 11:24:17.2962+00', '2026-06-02 11:24:17.300031+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'ea2deaeb-4066-4e0b-bce9-029495d4b118', 'authenticated', 'authenticated', 'ibrahim.musa@seed.roomie.ng', '$2a$10$YqsnUiv5hl7FKiglg8ORXunY6JvARHag1knKyKY82mJMGX9p8aq9G', '2026-06-02 11:24:26.966759+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Ibrahim Musa", "avatar_url": "https://i.pravatar.cc/150?img=15", "email_verified": true}', NULL, '2026-06-02 11:24:26.96427+00', '2026-06-02 11:24:26.967346+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'e25b72c1-ac97-4c0f-83aa-52601eecad77', 'authenticated', 'authenticated', 'tunde.afolabi@seed.roomie.ng', '$2a$10$q0hUh4du2gR37DFemOWX.uhygr1K7D9arAwiVY9wT6BKISFviudbu', '2026-06-02 11:24:20.932101+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Tunde Afolabi", "avatar_url": "https://i.pravatar.cc/150?img=11", "email_verified": true}', NULL, '2026-06-02 11:24:20.913699+00', '2026-06-02 11:24:20.933711+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '081aa072-b7a3-47e4-b513-74a60b35237c', 'authenticated', 'authenticated', 'kemi.adebayo@seed.roomie.ng', '$2a$10$ADQUTIUzJ6Rgym97YWGyE.Hmf8Vi6W3nEwgMFIDx/8v0P2szVOQyC', '2026-06-02 11:24:35.746312+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Kemi Adebayo", "avatar_url": "https://i.pravatar.cc/150?img=21", "email_verified": true}', NULL, '2026-06-02 11:24:35.743056+00', '2026-06-02 11:24:35.747004+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'be2bc423-154a-432f-bc3a-3579db11f77c', 'authenticated', 'authenticated', 'segun.olawale@seed.roomie.ng', '$2a$10$e.tDDgdtAM84UsRVV92ooeZNOBgFY3WQ2C5bH.XFkqCzyz4RQdiK6', '2026-06-02 11:24:32.92958+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Segun Olawale", "avatar_url": "https://i.pravatar.cc/150?img=19", "email_verified": true}', NULL, '2026-06-02 11:24:32.927247+00', '2026-06-02 11:24:32.930175+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '45fdfbde-6954-4765-8f58-2c7c47173ebe', 'authenticated', 'authenticated', 'halima.abdullahi@seed.roomie.ng', '$2a$10$67A6FyueSpMHw7GadzxhZ.DcEYXb6p3gkBQ3GOHLwBL8m27XLVtkW', '2026-06-02 11:24:44.196124+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Halima Abdullahi", "avatar_url": "https://i.pravatar.cc/150?img=25", "email_verified": true}', NULL, '2026-06-02 11:24:44.193564+00', '2026-06-02 11:24:44.196869+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'a6cdef81-a309-4d4c-83de-7f42c11732d2', 'authenticated', 'authenticated', 'david.akintola@seed.roomie.ng', '$2a$10$bPzcgg94QGF1ikXy6Cn17OPoexyfkauBGHSRGfbyD/.Z8BPLYDbS.', '2026-06-02 11:24:47.448731+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "David Akintola", "avatar_url": "https://i.pravatar.cc/150?img=27", "email_verified": true}', NULL, '2026-06-02 11:24:47.446384+00', '2026-06-02 11:24:47.449377+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '93744de5-5c26-49fe-959c-9459668d1184', 'authenticated', 'authenticated', 'blessing.onyeka@seed.roomie.ng', '$2a$10$KT7Ij6Qw5ZDk9gEwRgo9ruMwQemm9gSv2GmX4386HR073AIfxdSh.', '2026-06-02 11:24:49.743505+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Blessing Onyeka", "avatar_url": "https://i.pravatar.cc/150?img=29", "email_verified": true}', NULL, '2026-06-02 11:24:49.741086+00', '2026-06-02 11:24:49.744157+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '458124e4-346e-4984-accb-86394b968816', 'authenticated', 'authenticated', 'michael.obi@seed.roomie.ng', '$2a$10$EixIrrUtXm7Fhw656Hpt/eaTB11sivrI3EfbC4R.BKdDP2t3tnsru', '2026-06-02 11:24:53.878346+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Michael Obi", "avatar_url": "https://i.pravatar.cc/150?img=31", "email_verified": true}', NULL, '2026-06-02 11:24:53.874468+00', '2026-06-02 11:24:53.878955+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '36e7ba69-eae4-44bf-9bf7-19983a019a95', 'authenticated', 'authenticated', 'yetunde.balogun@seed.roomie.ng', '$2a$10$TN6AO0.J6puyZG8qLKl1WOJTBg0UOjB6B9wpl1NZsCP1YjqqQyJKG', '2026-06-02 11:25:15.440011+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Yetunde Balogun", "avatar_url": "https://i.pravatar.cc/150?img=41", "email_verified": true}', NULL, '2026-06-02 11:25:15.437472+00', '2026-06-02 11:25:15.440656+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'authenticated', 'authenticated', 'contact@unihousing.ng', '$2a$06$j8xPVDqbcyztJ0NEMJ5.RuskQpQi.eK5ashY4HlGgkG8SNmc0lgra', '2026-06-07 15:35:47.774807+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-06-07 16:30:11.616731+00', '{"provider": "email", "providers": ["email"]}', '{"full_name": "UniHousing Lagos", "email_verified": true}', NULL, '2026-06-07 15:35:47.774807+00', '2026-06-07 16:30:11.629941+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '24e25323-8d5f-4bc2-86ec-dc1ef99bc3ec', 'authenticated', 'authenticated', 'sade.fashola@seed.roomie.ng', '$2a$10$hphLUcPCaPx1kc1LNbNJAu8ZA3f.vtFU89EE30NwVt58dKtVYJAF6', '2026-06-02 11:24:56.854952+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Sade Fashola", "avatar_url": "https://i.pravatar.cc/150?img=33", "email_verified": true}', NULL, '2026-06-02 11:24:56.85225+00', '2026-06-02 11:24:56.855552+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'f8126ff1-fc20-4bb5-af12-eb136d6cf842', 'authenticated', 'authenticated', 'rotimi.adeleke@seed.roomie.ng', '$2a$10$v50My5U8c1LTboLdY4btv.8EHXfMn/3/ShpcAt6k7KDXIbGEb2Rb2', '2026-06-02 11:25:23.374598+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Rotimi Adeleke", "avatar_url": "https://i.pravatar.cc/150?img=47", "email_verified": true}', NULL, '2026-06-02 11:25:23.372068+00', '2026-06-02 11:25:23.375265+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '4a372951-78c2-4b1b-926e-00be853415aa', 'authenticated', 'authenticated', 'kenny.okonkwo@seed.roomie.ng', '$2a$10$JI.Iuw8CrOTTkf8FfJF.uuHXttdNGh9P.W5Jizc3XIWk62IuPkzx6', '2026-06-02 11:25:00.033168+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Kenny Okonkwo", "avatar_url": "https://i.pravatar.cc/150?img=35", "email_verified": true}', NULL, '2026-06-02 11:25:00.030423+00', '2026-06-02 11:25:00.034591+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '4ab648e0-105c-4e38-9466-318eac4086d5', 'authenticated', 'authenticated', 'chuka.anyanwu@seed.roomie.ng', '$2a$10$iodQvgv2lmSGN8juKgmXY.dlh9Rg9dKfXSQl8kDh0sRDheMCICO76', '2026-06-02 11:25:17.940913+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Chuka Anyanwu", "avatar_url": "https://i.pravatar.cc/150?img=43", "email_verified": true}', NULL, '2026-06-02 11:25:17.938316+00', '2026-06-02 11:25:17.941562+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'b7191868-9541-4c2a-92d8-8eacf232ae7b', 'authenticated', 'authenticated', 'nkechi.okafor@seed.roomie.ng', '$2a$10$YDmMfXdbhAgLBWga29v8/OW1utzciVJNWklZIWZWY6J3lQg3LhrkS', '2026-06-02 11:25:08.599016+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Nkechi Okafor", "avatar_url": "https://i.pravatar.cc/150?img=37", "email_verified": true}', NULL, '2026-06-02 11:25:08.596649+00', '2026-06-02 11:25:08.599628+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '0f25e9b5-3474-428b-a0a3-4b1996cdb290', 'authenticated', 'authenticated', 'frank.egwuatu@seed.roomie.ng', '$2a$10$KhfelQHt6r0/Id7C692KkeDRxsIXvZB.5Da7pk7hBqObQSZ7GQv1m', '2026-06-02 11:25:12.245098+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Frank Egwuatu", "avatar_url": "https://i.pravatar.cc/150?img=39", "email_verified": true}', NULL, '2026-06-02 11:25:12.238245+00', '2026-06-02 11:25:12.245836+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '561a5b50-803d-49be-ad0a-92876914b58d', 'authenticated', 'authenticated', 'obiageli.nwobi@seed.roomie.ng', '$2a$10$zGbfZn3YlVVN48NniSvVCe2UPD4cfgFe/2hjqJCBko7GFg8kshnSa', '2026-06-02 11:25:26.261923+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Obiageli Nwobi", "avatar_url": "https://i.pravatar.cc/150?img=49", "email_verified": true}', NULL, '2026-06-02 11:25:26.259353+00', '2026-06-02 11:25:26.262539+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '8f0138ad-28cf-4451-89fb-fd05952d219e', 'authenticated', 'authenticated', 'aisha.garba@seed.roomie.ng', '$2a$10$zQHdNjqHchT9efctbfv.S.UygYNhyAQUuY/zlvLvnfa.Phxa5Wesm', '2026-06-02 11:25:20.425675+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Aisha Garba", "avatar_url": "https://i.pravatar.cc/150?img=45", "email_verified": true}', NULL, '2026-06-02 11:25:20.422861+00', '2026-06-02 11:25:20.426389+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', 'authenticated', 'authenticated', 'hello@abujapad.ng', '$2a$06$QxbPWr/jdp1DQfrO/PTVj.xYZN1QE5aLSBiaD4OSSRBLBl8H34bxu', '2026-06-07 15:35:47.774807+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-06-07 15:57:34.863176+00', '{"provider": "email", "providers": ["email"]}', '{"full_name": "AbujaStudentPad", "email_verified": true}', NULL, '2026-06-07 15:35:47.774807+00', '2026-06-07 15:59:45.629548+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa', 'authenticated', 'authenticated', 'info@unicrib.ng', '$2a$06$vb931qPqoLEUmo1UY8VSmeCAp4N2.asqzcFXo5fciXawf9kuOEzY2', '2026-06-07 15:35:47.774807+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "UniCrib Ibadan", "email_verified": true}', NULL, '2026-06-07 15:35:47.774807+00', '2026-06-07 15:59:45.629548+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-0004-0004-0004-aaaaaaaaaaaa', 'authenticated', 'authenticated', 'rooms@phrooms.ng', '$2a$06$1U.w5MGSZ/up8iIVY0SbFuuLmjlYWCOVNSZe17He8MOS3IjDvJ7Fm', '2026-06-07 15:35:47.774807+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "PortHarcourt Rooms", "email_verified": true}', NULL, '2026-06-07 15:35:47.774807+00', '2026-06-07 15:59:45.629548+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-0005-0005-0005-aaaaaaaaaaaa', 'authenticated', 'authenticated', 'contact@enuguhomes.ng', '$2a$06$OnSUclxwNXo7nDmxvsJvA.YYQYaa048vqlFl5Iks0arHbYCXRTyPi', '2026-06-07 15:35:47.774807+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "EnuguStudentHomes", "email_verified": true}', NULL, '2026-06-07 15:35:47.774807+00', '2026-06-07 15:59:45.629548+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '11111111-0001-0001-0001-000000000001', 'authenticated', 'authenticated', 'amara.okafor@seed.roomie.ng', '$2a$10$B0s15wP.KXxCUzorPFlhseCnvbnFwl2tx83oCFrGPxJN2qBNTRqca', '2026-06-02 11:46:39.788605+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-06-07 15:45:28.42704+00', '{"provider": "email", "providers": ["email"]}', '{"full_name": "Amara Okafor", "avatar_url": "https://i.pravatar.cc/150?img=1", "email_verified": true}', NULL, '2026-06-01 12:38:14.202222+00', '2026-06-07 15:59:45.629548+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', 'authenticated', 'authenticated', 'admin@roomie.ng', '$2a$06$nmf/4fzT0st7oLUKJI5zaON2phVtocaMjOgPbE9tcuHTxw76coFBC', '2026-06-07 15:35:47.774807+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-06-27 15:03:10.736395+00', '{"provider": "email", "providers": ["email"]}', '{"full_name": "Roomie Super Admin", "email_verified": true}', NULL, '2026-06-07 15:35:47.774807+00', '2026-06-27 18:14:25.220668+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('114330009187650815089', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', '{"iss": "https://accounts.google.com", "sub": "114330009187650815089", "name": "Bn Usmann", "email": "bn.usmann22@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocJ0QnKP8-p8Vhqy9Ki4p1IHuMhVard96lnTdcvLAOApKz_TxZcv=s96-c", "full_name": "Bn Usmann", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocJ0QnKP8-p8Vhqy9Ki4p1IHuMhVard96lnTdcvLAOApKz_TxZcv=s96-c", "provider_id": "114330009187650815089", "email_verified": true, "phone_verified": false}', 'google', '2026-05-31 20:03:30.452327+00', '2026-05-31 20:03:30.452378+00', '2026-06-27 14:21:08.43187+00', 'd7abc88a-7f89-4c53-ae20-0be503fe39ae'),
	('188b2eb1-0f1b-4577-a514-8dc12fa05d78', '188b2eb1-0f1b-4577-a514-8dc12fa05d78', '{"sub": "188b2eb1-0f1b-4577-a514-8dc12fa05d78", "email": "emeka.nwosu@seed.roomie.ng", "email_verified": false, "phone_verified": false}', 'email', '2026-06-02 11:24:06.329207+00', '2026-06-02 11:24:06.32926+00', '2026-06-02 11:24:06.32926+00', '8eb53509-85d2-4a6f-939d-e577b6afb576'),
	('81ea0d77-218a-4038-8b7c-170029dc487e', '81ea0d77-218a-4038-8b7c-170029dc487e', '{"sub": "81ea0d77-218a-4038-8b7c-170029dc487e", "email": "fatimah.bello@seed.roomie.ng", "email_verified": false, "phone_verified": false}', 'email', '2026-06-02 11:24:09.499247+00', '2026-06-02 11:24:09.499317+00', '2026-06-02 11:24:09.499317+00', 'c45f07c5-9d7a-4d62-bd12-e52a0c27c8da'),
	('349afa75-1705-4f99-b6c3-13e7e9540e25', '349afa75-1705-4f99-b6c3-13e7e9540e25', '{"sub": "349afa75-1705-4f99-b6c3-13e7e9540e25", "email": "chidi.eze@seed.roomie.ng", "email_verified": false, "phone_verified": false}', 'email', '2026-06-02 11:24:12.623331+00', '2026-06-02 11:24:12.6234+00', '2026-06-02 11:24:12.6234+00', 'a80546d3-8a29-423e-b50c-4223c231189f'),
	('493f92ff-fa12-4ef5-9b43-f5e48575b395', '493f92ff-fa12-4ef5-9b43-f5e48575b395', '{"sub": "493f92ff-fa12-4ef5-9b43-f5e48575b395", "email": "ngozi.adeyemi@seed.roomie.ng", "email_verified": false, "phone_verified": false}', 'email', '2026-06-02 11:24:17.297704+00', '2026-06-02 11:24:17.297774+00', '2026-06-02 11:24:17.297774+00', 'b8f84b21-50fc-4c23-a182-3ea63d383a99'),
	('e25b72c1-ac97-4c0f-83aa-52601eecad77', 'e25b72c1-ac97-4c0f-83aa-52601eecad77', '{"sub": "e25b72c1-ac97-4c0f-83aa-52601eecad77", "email": "tunde.afolabi@seed.roomie.ng", "email_verified": false, "phone_verified": false}', 'email', '2026-06-02 11:24:20.918227+00', '2026-06-02 11:24:20.918296+00', '2026-06-02 11:24:20.918296+00', 'cb194cf8-d180-4195-a093-ff75600bd61b'),
	('195862f2-7212-44e3-b908-0b3055debfdf', '195862f2-7212-44e3-b908-0b3055debfdf', '{"sub": "195862f2-7212-44e3-b908-0b3055debfdf", "email": "adaeze.okoro@seed.roomie.ng", "email_verified": false, "phone_verified": false}', 'email', '2026-06-02 11:24:23.951627+00', '2026-06-02 11:24:23.951682+00', '2026-06-02 11:24:23.951682+00', '09161f7d-c3c0-4b13-8eea-f31ff9aceb7b'),
	('ea2deaeb-4066-4e0b-bce9-029495d4b118', 'ea2deaeb-4066-4e0b-bce9-029495d4b118', '{"sub": "ea2deaeb-4066-4e0b-bce9-029495d4b118", "email": "ibrahim.musa@seed.roomie.ng", "email_verified": false, "phone_verified": false}', 'email', '2026-06-02 11:24:26.965577+00', '2026-06-02 11:24:26.965627+00', '2026-06-02 11:24:26.965627+00', '9c99f8de-fa53-49c3-8c8d-c54bbf798169'),
	('667097ba-a6f4-4935-968c-51723217c07a', '667097ba-a6f4-4935-968c-51723217c07a', '{"sub": "667097ba-a6f4-4935-968c-51723217c07a", "email": "chioma.nwachukwu@seed.roomie.ng", "email_verified": false, "phone_verified": false}', 'email', '2026-06-02 11:24:29.965351+00', '2026-06-02 11:24:29.965399+00', '2026-06-02 11:24:29.965399+00', '2272fe39-f95b-49b1-b184-a7b2fd0eba5c'),
	('be2bc423-154a-432f-bc3a-3579db11f77c', 'be2bc423-154a-432f-bc3a-3579db11f77c', '{"sub": "be2bc423-154a-432f-bc3a-3579db11f77c", "email": "segun.olawale@seed.roomie.ng", "email_verified": false, "phone_verified": false}', 'email', '2026-06-02 11:24:32.928395+00', '2026-06-02 11:24:32.928442+00', '2026-06-02 11:24:32.928442+00', 'e693d2ec-330e-433d-96fc-5c8423e162c8'),
	('081aa072-b7a3-47e4-b513-74a60b35237c', '081aa072-b7a3-47e4-b513-74a60b35237c', '{"sub": "081aa072-b7a3-47e4-b513-74a60b35237c", "email": "kemi.adebayo@seed.roomie.ng", "email_verified": false, "phone_verified": false}', 'email', '2026-06-02 11:24:35.745078+00', '2026-06-02 11:24:35.745126+00', '2026-06-02 11:24:35.745126+00', '4db694cb-9c34-45fd-8b69-1cf4164400cf'),
	('da6f71c1-4707-401f-a932-6db6e8c18928', 'da6f71c1-4707-401f-a932-6db6e8c18928', '{"sub": "da6f71c1-4707-401f-a932-6db6e8c18928", "email": "uche.obiechina@seed.roomie.ng", "email_verified": false, "phone_verified": false}', 'email', '2026-06-02 11:24:39.20991+00', '2026-06-02 11:24:39.20996+00', '2026-06-02 11:24:39.20996+00', 'ad6b69af-5513-40d9-adfb-369cd2a0708b'),
	('45fdfbde-6954-4765-8f58-2c7c47173ebe', '45fdfbde-6954-4765-8f58-2c7c47173ebe', '{"sub": "45fdfbde-6954-4765-8f58-2c7c47173ebe", "email": "halima.abdullahi@seed.roomie.ng", "email_verified": false, "phone_verified": false}', 'email', '2026-06-02 11:24:44.194808+00', '2026-06-02 11:24:44.194855+00', '2026-06-02 11:24:44.194855+00', 'a56b28b3-3742-47a5-bafd-e01d3e111ac9'),
	('a6cdef81-a309-4d4c-83de-7f42c11732d2', 'a6cdef81-a309-4d4c-83de-7f42c11732d2', '{"sub": "a6cdef81-a309-4d4c-83de-7f42c11732d2", "email": "david.akintola@seed.roomie.ng", "email_verified": false, "phone_verified": false}', 'email', '2026-06-02 11:24:47.447543+00', '2026-06-02 11:24:47.447589+00', '2026-06-02 11:24:47.447589+00', 'c4170a20-5a8e-4d18-8851-ed6da1d4c0f2'),
	('93744de5-5c26-49fe-959c-9459668d1184', '93744de5-5c26-49fe-959c-9459668d1184', '{"sub": "93744de5-5c26-49fe-959c-9459668d1184", "email": "blessing.onyeka@seed.roomie.ng", "email_verified": false, "phone_verified": false}', 'email', '2026-06-02 11:24:49.742311+00', '2026-06-02 11:24:49.742364+00', '2026-06-02 11:24:49.742364+00', '11e41e62-186c-4bae-8145-64598f13ab68'),
	('458124e4-346e-4984-accb-86394b968816', '458124e4-346e-4984-accb-86394b968816', '{"sub": "458124e4-346e-4984-accb-86394b968816", "email": "michael.obi@seed.roomie.ng", "email_verified": false, "phone_verified": false}', 'email', '2026-06-02 11:24:53.875633+00', '2026-06-02 11:24:53.875681+00', '2026-06-02 11:24:53.875681+00', 'ca328a7b-50aa-4fa8-bb56-5bbca5801e03'),
	('24e25323-8d5f-4bc2-86ec-dc1ef99bc3ec', '24e25323-8d5f-4bc2-86ec-dc1ef99bc3ec', '{"sub": "24e25323-8d5f-4bc2-86ec-dc1ef99bc3ec", "email": "sade.fashola@seed.roomie.ng", "email_verified": false, "phone_verified": false}', 'email', '2026-06-02 11:24:56.853547+00', '2026-06-02 11:24:56.853598+00', '2026-06-02 11:24:56.853598+00', '05da961f-4580-4b5f-9883-d9307e7b7b01'),
	('4a372951-78c2-4b1b-926e-00be853415aa', '4a372951-78c2-4b1b-926e-00be853415aa', '{"sub": "4a372951-78c2-4b1b-926e-00be853415aa", "email": "kenny.okonkwo@seed.roomie.ng", "email_verified": false, "phone_verified": false}', 'email', '2026-06-02 11:25:00.031606+00', '2026-06-02 11:25:00.031657+00', '2026-06-02 11:25:00.031657+00', 'cebc63ba-b467-4456-9406-8dc33376a375'),
	('b7191868-9541-4c2a-92d8-8eacf232ae7b', 'b7191868-9541-4c2a-92d8-8eacf232ae7b', '{"sub": "b7191868-9541-4c2a-92d8-8eacf232ae7b", "email": "nkechi.okafor@seed.roomie.ng", "email_verified": false, "phone_verified": false}', 'email', '2026-06-02 11:25:08.597838+00', '2026-06-02 11:25:08.597886+00', '2026-06-02 11:25:08.597886+00', '0ac9a32e-e76e-41a1-a4c6-614cde7ba6fa'),
	('0f25e9b5-3474-428b-a0a3-4b1996cdb290', '0f25e9b5-3474-428b-a0a3-4b1996cdb290', '{"sub": "0f25e9b5-3474-428b-a0a3-4b1996cdb290", "email": "frank.egwuatu@seed.roomie.ng", "email_verified": false, "phone_verified": false}', 'email', '2026-06-02 11:25:12.243292+00', '2026-06-02 11:25:12.243348+00', '2026-06-02 11:25:12.243348+00', 'e1c78ac1-cbb4-475b-abe3-b21b42672724'),
	('36e7ba69-eae4-44bf-9bf7-19983a019a95', '36e7ba69-eae4-44bf-9bf7-19983a019a95', '{"sub": "36e7ba69-eae4-44bf-9bf7-19983a019a95", "email": "yetunde.balogun@seed.roomie.ng", "email_verified": false, "phone_verified": false}', 'email', '2026-06-02 11:25:15.438778+00', '2026-06-02 11:25:15.438828+00', '2026-06-02 11:25:15.438828+00', '156baaef-4841-4154-b82f-a51fef76127c'),
	('4ab648e0-105c-4e38-9466-318eac4086d5', '4ab648e0-105c-4e38-9466-318eac4086d5', '{"sub": "4ab648e0-105c-4e38-9466-318eac4086d5", "email": "chuka.anyanwu@seed.roomie.ng", "email_verified": false, "phone_verified": false}', 'email', '2026-06-02 11:25:17.939633+00', '2026-06-02 11:25:17.939679+00', '2026-06-02 11:25:17.939679+00', 'bf3b63e7-c309-45fc-a5ca-3f214e5746bf'),
	('11111111-0001-0001-0001-000000000001', '11111111-0001-0001-0001-000000000001', '{"sub": "11111111-0001-0001-0001-000000000001", "email": "amara.okafor@seed.roomie.ng", "email_verified": true, "phone_verified": false}', 'email', '2026-06-01 12:38:14.233427+00', '2026-06-01 12:38:14.233491+00', '2026-06-07 15:59:45.629548+00', '1c3849f2-9a9f-4d20-b630-03d33e33f71f'),
	('8f0138ad-28cf-4451-89fb-fd05952d219e', '8f0138ad-28cf-4451-89fb-fd05952d219e', '{"sub": "8f0138ad-28cf-4451-89fb-fd05952d219e", "email": "aisha.garba@seed.roomie.ng", "email_verified": false, "phone_verified": false}', 'email', '2026-06-02 11:25:20.424142+00', '2026-06-02 11:25:20.424191+00', '2026-06-02 11:25:20.424191+00', 'a8b2a75c-675f-4fae-ae8e-f12b78bcd9ca'),
	('f8126ff1-fc20-4bb5-af12-eb136d6cf842', 'f8126ff1-fc20-4bb5-af12-eb136d6cf842', '{"sub": "f8126ff1-fc20-4bb5-af12-eb136d6cf842", "email": "rotimi.adeleke@seed.roomie.ng", "email_verified": false, "phone_verified": false}', 'email', '2026-06-02 11:25:23.373352+00', '2026-06-02 11:25:23.373408+00', '2026-06-02 11:25:23.373408+00', 'a065ee8c-e6ea-45ef-bfb9-8e83a7e7cd51'),
	('561a5b50-803d-49be-ad0a-92876914b58d', '561a5b50-803d-49be-ad0a-92876914b58d', '{"sub": "561a5b50-803d-49be-ad0a-92876914b58d", "email": "obiageli.nwobi@seed.roomie.ng", "email_verified": false, "phone_verified": false}', 'email', '2026-06-02 11:25:26.260632+00', '2026-06-02 11:25:26.26068+00', '2026-06-02 11:25:26.26068+00', 'f12ce851-6559-48d5-a740-ca6a5a1cb873'),
	('aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', '{"sub": "aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa", "email": "contact@unihousing.ng", "email_verified": true, "phone_verified": false}', 'email', NULL, '2026-06-07 15:52:07.136615+00', '2026-06-07 15:59:45.629548+00', '646d125e-d84e-4eac-83ab-92e3ecc94a20'),
	('aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', 'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', '{"sub": "aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa", "email": "hello@abujapad.ng", "email_verified": true, "phone_verified": false}', 'email', NULL, '2026-06-07 15:52:07.136615+00', '2026-06-07 15:59:45.629548+00', 'e40ceb77-de4f-4d74-8583-35ba49f5f4b8'),
	('aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa', 'aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa', '{"sub": "aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa", "email": "info@unicrib.ng", "email_verified": true, "phone_verified": false}', 'email', NULL, '2026-06-07 15:52:07.136615+00', '2026-06-07 15:59:45.629548+00', '3ef8e351-de24-4143-b95a-eddc18a7a58a'),
	('aaaaaaaa-0004-0004-0004-aaaaaaaaaaaa', 'aaaaaaaa-0004-0004-0004-aaaaaaaaaaaa', '{"sub": "aaaaaaaa-0004-0004-0004-aaaaaaaaaaaa", "email": "rooms@phrooms.ng", "email_verified": true, "phone_verified": false}', 'email', NULL, '2026-06-07 15:52:07.136615+00', '2026-06-07 15:59:45.629548+00', '99dbc23c-38d3-4238-acde-c370c389f942'),
	('aaaaaaaa-0005-0005-0005-aaaaaaaaaaaa', 'aaaaaaaa-0005-0005-0005-aaaaaaaaaaaa', '{"sub": "aaaaaaaa-0005-0005-0005-aaaaaaaaaaaa", "email": "contact@enuguhomes.ng", "email_verified": true, "phone_verified": false}', 'email', NULL, '2026-06-07 15:52:07.136615+00', '2026-06-07 15:59:45.629548+00', '925145fa-12f0-4797-a511-f30102df5163'),
	('bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', '{"sub": "bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb", "email": "admin@roomie.ng", "email_verified": true, "phone_verified": false}', 'email', NULL, '2026-06-07 15:52:07.136615+00', '2026-06-07 15:59:45.629548+00', 'dc4a151f-55be-45df-95d3-93b4eeeede27');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('ccb383ce-d773-4c63-ba2b-506788c20142', '11111111-0001-0001-0001-000000000001', '2026-06-07 15:45:28.428656+00', '2026-06-07 15:45:28.428656+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22621.4249', '105.127.17.141', NULL, NULL, NULL, NULL, NULL),
	('4dae2c61-3d87-4a3b-b411-394298f2df3c', 'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', '2026-06-07 15:57:34.863259+00', '2026-06-07 15:57:34.863259+00', NULL, 'aal1', NULL, NULL, NULL, '105.127.17.141', NULL, NULL, NULL, NULL, NULL),
	('a97944d3-56bc-4208-bb4d-f71bf75622d5', 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', '2026-06-08 14:22:09.442119+00', '2026-06-27 14:55:28.927516+00', NULL, 'aal1', NULL, '2026-06-27 14:55:28.927412', 'node', '135.129.124.213', NULL, NULL, NULL, NULL, NULL),
	('211fdc2e-1782-41d8-b629-cc2e326f01f1', '11111111-0001-0001-0001-000000000001', '2026-06-02 11:48:33.437906+00', '2026-06-02 11:48:33.437906+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22621.4249', '105.127.16.99', NULL, NULL, NULL, NULL, NULL),
	('badb829f-f966-467e-bbdb-fe79e1f59b84', 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', '2026-06-08 12:31:35.659046+00', '2026-06-08 13:38:09.211192+00', NULL, 'aal1', NULL, '2026-06-08 13:38:09.211082', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '105.127.16.79', NULL, NULL, NULL, NULL, NULL),
	('77672d10-8959-40bf-87dd-647c4ffb3ddd', '11111111-0001-0001-0001-000000000001', '2026-06-02 11:56:15.858536+00', '2026-06-02 18:22:17.126917+00', NULL, 'aal1', NULL, '2026-06-02 18:22:17.126825', 'node', '98.97.76.229', NULL, NULL, NULL, NULL, NULL),
	('00f06655-f8e1-4a72-8131-4680a138cef5', 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', '2026-06-27 15:03:10.739286+00', '2026-06-27 18:14:25.232586+00', NULL, 'aal1', NULL, '2026-06-27 18:14:25.232474', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '98.97.79.176', NULL, NULL, NULL, NULL, NULL),
	('11a40bca-779e-435d-b872-d80d9d8df86a', '81ea0d77-218a-4038-8b7c-170029dc487e', '2026-06-02 17:14:52.2914+00', '2026-06-14 16:10:38.491324+00', NULL, 'aal1', NULL, '2026-06-14 16:10:38.491218', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '105.112.17.16', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('211fdc2e-1782-41d8-b629-cc2e326f01f1', '2026-06-02 11:48:33.475636+00', '2026-06-02 11:48:33.475636+00', 'password', 'c8ce0003-c332-4621-8761-2e37bf498f34'),
	('77672d10-8959-40bf-87dd-647c4ffb3ddd', '2026-06-02 11:56:15.901063+00', '2026-06-02 11:56:15.901063+00', 'password', '21d226d7-0351-44b6-99be-b7be96a9e2fd'),
	('11a40bca-779e-435d-b872-d80d9d8df86a', '2026-06-02 17:14:52.35467+00', '2026-06-02 17:14:52.35467+00', 'password', '9ab683d8-35e9-4c30-b75f-8045125aff73'),
	('ccb383ce-d773-4c63-ba2b-506788c20142', '2026-06-07 15:45:28.461922+00', '2026-06-07 15:45:28.461922+00', 'password', '10e9b978-8538-47b7-89a9-0c67d520c3dc'),
	('4dae2c61-3d87-4a3b-b411-394298f2df3c', '2026-06-07 15:57:34.866285+00', '2026-06-07 15:57:34.866285+00', 'password', 'b2d9bd82-43be-4562-90b9-51a13d8ffb1b'),
	('badb829f-f966-467e-bbdb-fe79e1f59b84', '2026-06-08 12:31:35.680676+00', '2026-06-08 12:31:35.680676+00', 'password', 'a46359c8-73e1-4a8c-8ad8-820e77f1206c'),
	('a97944d3-56bc-4208-bb4d-f71bf75622d5', '2026-06-08 14:22:09.496713+00', '2026-06-08 14:22:09.496713+00', 'password', 'd7c3be08-b071-452d-9c84-7687edf3dd08'),
	('00f06655-f8e1-4a72-8131-4680a138cef5', '2026-06-27 15:03:10.779322+00', '2026-06-27 15:03:10.779322+00', 'password', 'd65c3eb4-16d1-401d-bacd-96a0a1db12a8');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 50, 'dfef6r5ump6d', 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', true, '2026-06-08 12:31:35.668608+00', '2026-06-08 13:38:09.191227+00', NULL, 'badb829f-f966-467e-bbdb-fe79e1f59b84'),
	('00000000-0000-0000-0000-000000000000', 52, 'odzyse3jprdm', 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', false, '2026-06-08 13:38:09.197114+00', '2026-06-08 13:38:09.197114+00', 'dfef6r5ump6d', 'badb829f-f966-467e-bbdb-fe79e1f59b84'),
	('00000000-0000-0000-0000-000000000000', 53, '4onplxu3mo5l', 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', true, '2026-06-08 14:22:09.458912+00', '2026-06-08 18:45:03.011437+00', NULL, 'a97944d3-56bc-4208-bb4d-f71bf75622d5'),
	('00000000-0000-0000-0000-000000000000', 25, 'ipwgfznxs66n', '81ea0d77-218a-4038-8b7c-170029dc487e', true, '2026-06-02 18:30:13.652101+00', '2026-06-14 10:34:46.628951+00', '74xjyyoayptm', '11a40bca-779e-435d-b872-d80d9d8df86a'),
	('00000000-0000-0000-0000-000000000000', 58, 'rqsxprkbintp', '81ea0d77-218a-4038-8b7c-170029dc487e', true, '2026-06-14 10:34:46.629298+00', '2026-06-14 16:10:38.449491+00', 'ipwgfznxs66n', '11a40bca-779e-435d-b872-d80d9d8df86a'),
	('00000000-0000-0000-0000-000000000000', 59, '63bnvqlm7nsj', '81ea0d77-218a-4038-8b7c-170029dc487e', false, '2026-06-14 16:10:38.471904+00', '2026-06-14 16:10:38.471904+00', 'rqsxprkbintp', '11a40bca-779e-435d-b872-d80d9d8df86a'),
	('00000000-0000-0000-0000-000000000000', 12, 'ze3bn2c3h4mz', '11111111-0001-0001-0001-000000000001', false, '2026-06-02 11:48:33.462537+00', '2026-06-02 11:48:33.462537+00', NULL, '211fdc2e-1782-41d8-b629-cc2e326f01f1'),
	('00000000-0000-0000-0000-000000000000', 13, '2xkftdfg7mj3', '11111111-0001-0001-0001-000000000001', true, '2026-06-02 11:56:15.877646+00', '2026-06-02 13:06:16.051472+00', NULL, '77672d10-8959-40bf-87dd-647c4ffb3ddd'),
	('00000000-0000-0000-0000-000000000000', 56, 'xwu6x33urixa', 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', true, '2026-06-08 18:45:03.019148+00', '2026-06-27 14:55:28.894678+00', '4onplxu3mo5l', 'a97944d3-56bc-4208-bb4d-f71bf75622d5'),
	('00000000-0000-0000-0000-000000000000', 14, 'iziva3zixhsu', '11111111-0001-0001-0001-000000000001', true, '2026-06-02 13:06:16.064689+00', '2026-06-02 14:46:30.749246+00', '2xkftdfg7mj3', '77672d10-8959-40bf-87dd-647c4ffb3ddd'),
	('00000000-0000-0000-0000-000000000000', 64, 'ojagczdsfeot', 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', false, '2026-06-27 14:55:28.909229+00', '2026-06-27 14:55:28.909229+00', 'xwu6x33urixa', 'a97944d3-56bc-4208-bb4d-f71bf75622d5'),
	('00000000-0000-0000-0000-000000000000', 17, 'vh7gzxvtdcyd', '11111111-0001-0001-0001-000000000001', true, '2026-06-02 14:46:30.755053+00', '2026-06-02 15:52:08.487567+00', 'iziva3zixhsu', '77672d10-8959-40bf-87dd-647c4ffb3ddd'),
	('00000000-0000-0000-0000-000000000000', 65, 'r4h6gsvwdtjt', 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', true, '2026-06-27 15:03:10.769784+00', '2026-06-27 16:04:39.613559+00', NULL, '00f06655-f8e1-4a72-8131-4680a138cef5'),
	('00000000-0000-0000-0000-000000000000', 18, 'fdvzpbr3vnr4', '11111111-0001-0001-0001-000000000001', true, '2026-06-02 15:52:08.502045+00', '2026-06-02 17:11:57.41276+00', 'vh7gzxvtdcyd', '77672d10-8959-40bf-87dd-647c4ffb3ddd'),
	('00000000-0000-0000-0000-000000000000', 66, 'p2putcqjt5ub', 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', true, '2026-06-27 16:04:39.621637+00', '2026-06-27 18:14:25.199956+00', 'r4h6gsvwdtjt', '00f06655-f8e1-4a72-8131-4680a138cef5'),
	('00000000-0000-0000-0000-000000000000', 67, 'ecc2grw7x7o2', 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', false, '2026-06-27 18:14:25.211073+00', '2026-06-27 18:14:25.211073+00', 'p2putcqjt5ub', '00f06655-f8e1-4a72-8131-4680a138cef5'),
	('00000000-0000-0000-0000-000000000000', 20, 'gm7nr23fe5jm', '11111111-0001-0001-0001-000000000001', true, '2026-06-02 17:11:57.421134+00', '2026-06-02 18:22:17.120429+00', 'fdvzpbr3vnr4', '77672d10-8959-40bf-87dd-647c4ffb3ddd'),
	('00000000-0000-0000-0000-000000000000', 24, 'cgxxq7hytqql', '11111111-0001-0001-0001-000000000001', false, '2026-06-02 18:22:17.122592+00', '2026-06-02 18:22:17.122592+00', 'gm7nr23fe5jm', '77672d10-8959-40bf-87dd-647c4ffb3ddd'),
	('00000000-0000-0000-0000-000000000000', 21, '74xjyyoayptm', '81ea0d77-218a-4038-8b7c-170029dc487e', true, '2026-06-02 17:14:52.324163+00', '2026-06-02 18:30:13.644355+00', NULL, '11a40bca-779e-435d-b872-d80d9d8df86a'),
	('00000000-0000-0000-0000-000000000000', 29, '6gmn6bukard5', '11111111-0001-0001-0001-000000000001', false, '2026-06-07 15:45:28.447554+00', '2026-06-07 15:45:28.447554+00', NULL, 'ccb383ce-d773-4c63-ba2b-506788c20142'),
	('00000000-0000-0000-0000-000000000000', 32, '5oaxt2pmmoxv', 'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', false, '2026-06-07 15:57:34.864966+00', '2026-06-07 15:57:34.864966+00', NULL, '4dae2c61-3d87-4a3b-b411-394298f2df3c');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."admin_users" ("id", "role", "created_at") VALUES
	('bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb', 'super_admin', '2026-06-07 15:35:47.774807+00');


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "display_name", "avatar_url", "bio", "age", "gender", "phone", "city", "state", "university", "faculty", "course", "year_of_study", "min_budget", "max_budget", "move_in_date", "lifestyle_tags", "sleep_schedule", "cleanliness", "noise_pref", "allows_smoking", "allows_pets", "allows_guests", "roommate_gender_pref", "student_verified", "student_id_front_url", "student_id_back_url", "verification_status", "verified_at", "onboarding_step", "onboarding_complete", "last_seen_at", "is_active", "created_at", "updated_at") VALUES
	('188b2eb1-0f1b-4577-a514-8dc12fa05d78', 'Emeka Nwosu', 'https://i.pravatar.cc/150?img=3', NULL, 21, 'male', NULL, 'Abuja', NULL, 'UNIABUJA', NULL, 'Computer Science', 3, 50000, 80000, NULL, '{gamer,studious,homebody}', 'night_owl', 'relaxed', 'moderate', false, false, true, NULL, false, NULL, NULL, 'UNVERIFIED', NULL, 6, true, '2026-06-02 11:24:08.114+00', true, '2026-06-02 11:24:06.316981+00', '2026-06-02 11:24:07.982914+00'),
	('81ea0d77-218a-4038-8b7c-170029dc487e', 'Fatimah Bello', 'https://i.pravatar.cc/150?img=5', NULL, 20, 'female', NULL, 'Lagos', NULL, 'UNILAG', NULL, 'Pharmacy', 2, 60000, 100000, NULL, '{religious,studious,homebody}', 'early_bird', 'tidy', 'very_quiet', false, false, true, NULL, true, NULL, NULL, 'VERIFIED', NULL, 6, true, '2026-06-02 19:05:41.969+00', true, '2026-06-02 11:24:09.490155+00', '2026-06-02 19:05:42.518799+00'),
	('349afa75-1705-4f99-b6c3-13e7e9540e25', 'Chidi Eze', 'https://i.pravatar.cc/150?img=7', NULL, 22, 'male', NULL, 'Enugu', NULL, 'UNN', NULL, 'Mechanical Engineering', 4, 40000, 70000, NULL, '{foodie,social,athletic}', 'flexible', 'tidy', 'moderate', false, false, true, NULL, false, NULL, NULL, 'UNVERIFIED', NULL, 6, true, '2026-06-02 11:24:14.624+00', true, '2026-06-02 11:24:12.621494+00', '2026-06-02 11:24:14.505681+00'),
	('493f92ff-fa12-4ef5-9b43-f5e48575b395', 'Ngozi Adeyemi', 'https://i.pravatar.cc/150?img=9', NULL, 23, 'female', NULL, 'Ibadan', NULL, 'UI', NULL, 'Law', 5, 55000, 90000, NULL, '{studious,homebody,traveler}', 'night_owl', 'very_tidy', 'very_quiet', false, false, true, NULL, true, NULL, NULL, 'VERIFIED', NULL, 6, true, '2026-06-02 11:24:19.182+00', true, '2026-06-02 11:24:17.295885+00', '2026-06-02 11:24:19.060794+00'),
	('e25b72c1-ac97-4c0f-83aa-52601eecad77', 'Tunde Afolabi', 'https://i.pravatar.cc/150?img=11', NULL, 21, 'male', NULL, 'Lagos', NULL, 'LASU', NULL, 'Mass Communication', 3, 45000, 75000, NULL, '{social,traveler,foodie}', 'flexible', 'relaxed', 'lively', false, false, true, NULL, false, NULL, NULL, 'UNVERIFIED', NULL, 6, true, '2026-06-02 11:24:22.606+00', true, '2026-06-02 11:24:20.911522+00', '2026-06-02 11:24:22.452961+00'),
	('195862f2-7212-44e3-b908-0b3055debfdf', 'Adaeze Okoro', 'https://i.pravatar.cc/150?img=13', NULL, 22, 'female', NULL, 'Port Harcourt', NULL, 'UNIPORT', NULL, 'Medicine and Surgery', 3, 80000, 150000, NULL, '{studious,religious,homebody}', 'early_bird', 'very_tidy', 'quiet', false, false, true, NULL, true, NULL, NULL, 'VERIFIED', NULL, 6, true, '2026-06-02 11:24:25.846+00', true, '2026-06-02 11:24:23.94898+00', '2026-06-02 11:24:25.673421+00'),
	('ea2deaeb-4066-4e0b-bce9-029495d4b118', 'Ibrahim Musa', 'https://i.pravatar.cc/150?img=15', NULL, 20, 'male', NULL, 'Kano', NULL, 'BUK', NULL, 'Accounting', 2, 30000, 55000, NULL, '{religious,studious,homebody}', 'early_bird', 'tidy', 'quiet', false, false, true, NULL, false, NULL, NULL, 'UNVERIFIED', NULL, 6, true, '2026-06-02 11:24:28.261+00', true, '2026-06-02 11:24:26.963967+00', '2026-06-02 11:24:28.087836+00'),
	('667097ba-a6f4-4935-968c-51723217c07a', 'Chioma Nwachukwu', 'https://i.pravatar.cc/150?img=17', NULL, 21, 'female', NULL, 'Abuja', NULL, 'BAZE', NULL, 'Finance', 3, 65000, 110000, NULL, '{social,foodie,traveler}', 'night_owl', 'tidy', 'moderate', false, false, true, NULL, false, NULL, NULL, 'UNVERIFIED', NULL, 6, true, '2026-06-02 11:24:31.646+00', true, '2026-06-02 11:24:29.961115+00', '2026-06-02 11:24:31.48577+00'),
	('11111111-0001-0001-0001-000000000001', 'Amara Okafor', 'https://i.pravatar.cc/150?img=1', NULL, 19, 'female', NULL, 'Lagos', NULL, 'UNILAG', NULL, 'Business Administration', 2, 70000, 120000, NULL, '{studious,homebody,religious}', 'early_bird', 'very_tidy', 'quiet', false, false, true, NULL, true, NULL, NULL, 'VERIFIED', NULL, 6, true, '2026-06-02 19:07:40.982+00', true, '2026-06-01 12:38:14.193231+00', '2026-06-02 19:07:41.843361+00'),
	('be2bc423-154a-432f-bc3a-3579db11f77c', 'Segun Olawale', 'https://i.pravatar.cc/150?img=19', NULL, 20, 'male', NULL, 'Lagos', NULL, 'UNILAG', NULL, 'Economics', 2, 45000, 80000, NULL, '{athletic,social,gamer}', 'flexible', 'relaxed', 'moderate', false, false, true, NULL, false, NULL, NULL, 'UNVERIFIED', NULL, 6, true, '2026-06-02 11:24:34.723+00', true, '2026-06-02 11:24:32.926933+00', '2026-06-02 11:24:34.574875+00'),
	('081aa072-b7a3-47e4-b513-74a60b35237c', 'Kemi Adebayo', 'https://i.pravatar.cc/150?img=21', NULL, 22, 'female', NULL, 'Lagos', NULL, 'UNILAG', NULL, 'Biochemistry', 4, 60000, 100000, NULL, '{studious,religious,homebody}', 'early_bird', 'very_tidy', 'quiet', false, false, true, NULL, true, NULL, NULL, 'VERIFIED', NULL, 6, true, '2026-06-02 11:24:37.554+00', true, '2026-06-02 11:24:35.742755+00', '2026-06-02 11:24:37.392451+00'),
	('da6f71c1-4707-401f-a932-6db6e8c18928', 'Uche Obiechina', 'https://i.pravatar.cc/150?img=23', NULL, 23, 'male', NULL, 'Enugu', NULL, 'UNN', NULL, 'Architecture', 5, 50000, 85000, NULL, '{studious,gamer,homebody}', 'night_owl', 'tidy', 'moderate', false, false, true, NULL, false, NULL, NULL, 'UNVERIFIED', NULL, 6, true, '2026-06-02 11:24:42.594+00', true, '2026-06-02 11:24:39.208176+00', '2026-06-02 11:24:42.432627+00'),
	('45fdfbde-6954-4765-8f58-2c7c47173ebe', 'Halima Abdullahi', 'https://i.pravatar.cc/150?img=25', NULL, 20, 'female', NULL, 'Kano', NULL, 'BUK', NULL, 'Nursing', 2, 35000, 60000, NULL, '{religious,studious,homebody}', 'early_bird', 'tidy', 'quiet', false, false, true, NULL, false, NULL, NULL, 'UNVERIFIED', NULL, 6, true, '2026-06-02 11:24:45.805+00', true, '2026-06-02 11:24:44.193261+00', '2026-06-02 11:24:45.623017+00'),
	('a6cdef81-a309-4d4c-83de-7f42c11732d2', 'David Akintola', 'https://i.pravatar.cc/150?img=27', NULL, 21, 'male', NULL, 'Ibadan', NULL, 'UI', NULL, 'Physics', 3, 45000, 75000, NULL, '{studious,athletic,gamer}', 'flexible', 'tidy', 'moderate', false, false, true, NULL, false, NULL, NULL, 'UNVERIFIED', NULL, 6, true, '2026-06-02 11:24:48.744+00', true, '2026-06-02 11:24:47.446076+00', '2026-06-02 11:24:48.560729+00'),
	('93744de5-5c26-49fe-959c-9459668d1184', 'Blessing Onyeka', 'https://i.pravatar.cc/150?img=29', NULL, 22, 'female', NULL, 'Port Harcourt', NULL, 'UNIPORT', NULL, 'Chemical Engineering', 3, 55000, 90000, NULL, '{studious,social,homebody}', 'flexible', 'tidy', 'moderate', false, false, true, NULL, true, NULL, NULL, 'VERIFIED', NULL, 6, true, '2026-06-02 11:24:52.476+00', true, '2026-06-02 11:24:49.740766+00', '2026-06-02 11:24:52.306802+00'),
	('458124e4-346e-4984-accb-86394b968816', 'Michael Obi', 'https://i.pravatar.cc/150?img=31', NULL, 24, 'male', NULL, 'Abuja', NULL, 'UNIABUJA', NULL, 'Political Science', 4, 55000, 90000, NULL, '{social,traveler,foodie}', 'flexible', 'relaxed', 'lively', false, false, true, NULL, false, NULL, NULL, 'UNVERIFIED', NULL, 6, true, '2026-06-02 11:24:55.198+00', true, '2026-06-02 11:24:53.87416+00', '2026-06-02 11:24:55.031656+00'),
	('24e25323-8d5f-4bc2-86ec-dc1ef99bc3ec', 'Sade Fashola', 'https://i.pravatar.cc/150?img=33', NULL, 20, 'female', NULL, 'Lagos', NULL, 'LASU', NULL, 'Sociology', 2, 40000, 70000, NULL, '{social,foodie,traveler}', 'flexible', 'tidy', 'moderate', false, false, true, NULL, false, NULL, NULL, 'UNVERIFIED', NULL, 6, true, '2026-06-02 11:24:58.861+00', true, '2026-06-02 11:24:56.851113+00', '2026-06-02 11:24:58.675192+00'),
	('4a372951-78c2-4b1b-926e-00be853415aa', 'Kenny Okonkwo', 'https://i.pravatar.cc/150?img=35', NULL, 21, 'male', NULL, 'Enugu', NULL, 'UNN', NULL, 'Computer Engineering', 3, 45000, 75000, NULL, '{gamer,studious,homebody}', 'night_owl', 'relaxed', 'moderate', false, false, true, NULL, false, NULL, NULL, 'UNVERIFIED', NULL, 6, true, '2026-06-02 11:25:02.505+00', true, '2026-06-02 11:25:00.030113+00', '2026-06-02 11:25:02.4414+00'),
	('b7191868-9541-4c2a-92d8-8eacf232ae7b', 'Nkechi Okafor', 'https://i.pravatar.cc/150?img=37', NULL, 22, 'female', NULL, 'Lagos', NULL, 'UNILAG', NULL, 'Mass Communication', 3, 55000, 85000, NULL, '{social,traveler,foodie}', 'flexible', 'tidy', 'lively', false, false, true, NULL, false, NULL, NULL, 'UNVERIFIED', NULL, 6, true, '2026-06-02 11:25:10.927+00', true, '2026-06-02 11:25:08.596349+00', '2026-06-02 11:25:10.8412+00'),
	('0f25e9b5-3474-428b-a0a3-4b1996cdb290', 'Frank Egwuatu', 'https://i.pravatar.cc/150?img=39', NULL, 23, 'male', NULL, 'Abuja', NULL, 'UNIABUJA', NULL, 'Business Administration', 4, 60000, 100000, NULL, '{studious,athletic,homebody}', 'early_bird', 'tidy', 'moderate', false, false, true, NULL, false, NULL, NULL, 'UNVERIFIED', NULL, 6, true, '2026-06-02 11:25:14.006+00', true, '2026-06-02 11:25:12.237934+00', '2026-06-02 11:25:13.919063+00'),
	('36e7ba69-eae4-44bf-9bf7-19983a019a95', 'Yetunde Balogun', 'https://i.pravatar.cc/150?img=41', NULL, 21, 'female', NULL, 'Lagos', NULL, 'UNILAG', NULL, 'Economics', 3, 50000, 85000, NULL, '{studious,social,religious}', 'early_bird', 'tidy', 'quiet', false, false, true, NULL, true, NULL, NULL, 'VERIFIED', NULL, 6, true, '2026-06-02 11:25:16.748+00', true, '2026-06-02 11:25:15.437171+00', '2026-06-02 11:25:16.582609+00'),
	('4ab648e0-105c-4e38-9466-318eac4086d5', 'Chuka Anyanwu', 'https://i.pravatar.cc/150?img=43', NULL, 22, 'male', NULL, 'Nsukka', NULL, 'UNN', NULL, 'History', 4, 35000, 60000, NULL, '{studious,homebody,gamer}', 'night_owl', 'relaxed', 'moderate', false, false, true, NULL, false, NULL, NULL, 'UNVERIFIED', NULL, 6, true, '2026-06-02 11:25:19.235+00', true, '2026-06-02 11:25:17.937994+00', '2026-06-02 11:25:19.06664+00'),
	('8f0138ad-28cf-4451-89fb-fd05952d219e', 'Aisha Garba', 'https://i.pravatar.cc/150?img=45', NULL, 19, 'female', NULL, 'Kano', NULL, 'BUK', NULL, 'Public Health', 1, 30000, 55000, NULL, '{religious,studious,homebody}', 'early_bird', 'very_tidy', 'quiet', false, false, true, NULL, false, NULL, NULL, 'UNVERIFIED', NULL, 6, true, '2026-06-02 11:25:22.321+00', true, '2026-06-02 11:25:20.422532+00', '2026-06-02 11:25:22.176049+00'),
	('f8126ff1-fc20-4bb5-af12-eb136d6cf842', 'Rotimi Adeleke', 'https://i.pravatar.cc/150?img=47', NULL, 22, 'male', NULL, 'Ibadan', NULL, 'UI', NULL, 'Agricultural Science', 3, 40000, 65000, NULL, '{foodie,athletic,social}', 'flexible', 'tidy', 'moderate', false, false, true, NULL, false, NULL, NULL, 'UNVERIFIED', NULL, 6, true, '2026-06-02 11:25:25.077+00', true, '2026-06-02 11:25:23.371787+00', '2026-06-02 11:25:24.918468+00'),
	('561a5b50-803d-49be-ad0a-92876914b58d', 'Obiageli Nwobi', 'https://i.pravatar.cc/150?img=49', NULL, 20, 'female', NULL, 'Port Harcourt', NULL, 'UNIPORT', NULL, 'Nursing Science', 2, 45000, 75000, NULL, '{religious,studious,social}', 'early_bird', 'tidy', 'quiet', false, false, true, NULL, false, NULL, NULL, 'UNVERIFIED', NULL, 6, true, '2026-06-02 11:25:27.799+00', true, '2026-06-02 11:25:26.259027+00', '2026-06-02 11:25:27.684202+00'),
	('e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', 'Abdullahi  Jamil', 'https://lh3.googleusercontent.com/a/ACg8ocJ0QnKP8-p8Vhqy9Ki4p1IHuMhVard96lnTdcvLAOApKz_TxZcv=s96-c', NULL, 21, 'male', NULL, 'Kano', NULL, 'Bayero University Kano (BUK)', NULL, 'Software Engneering ', 3, 30000, 250000, NULL, '{studious,social,music-lover}', 'flexible', 'tidy', 'moderate', false, false, true, NULL, true, NULL, NULL, 'VERIFIED', NULL, 6, true, '2026-06-27 15:01:50.766+00', true, '2026-05-31 20:03:30.384003+00', '2026-06-27 15:01:50.567826+00');


--
-- Data for Name: connections; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."connections" ("id", "requester_id", "receiver_id", "status", "payment_reference", "amount_paid", "paid_at", "connected_at", "expires_at", "created_at", "updated_at") VALUES
	('330275d3-6720-4d35-bd3f-7867813de377', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', '11111111-0001-0001-0001-000000000001', 'ACTIVE', NULL, NULL, NULL, '2026-06-01 12:38:18.053+00', NULL, '2026-06-01 12:38:16.493923+00', '2026-06-01 12:38:16.493923+00'),
	('78353e91-269a-4e43-a928-f3d44b7f4eba', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', '8f0138ad-28cf-4451-89fb-fd05952d219e', 'ACTIVE', NULL, NULL, NULL, '2026-06-02 11:52:55.414+00', NULL, '2026-06-02 11:52:55.229707+00', '2026-06-02 11:52:55.229707+00'),
	('7a3c4ac1-3bc0-4d2c-b772-8f7eb966c303', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', '45fdfbde-6954-4765-8f58-2c7c47173ebe', 'ACTIVE', NULL, NULL, NULL, '2026-06-02 13:51:50.232+00', NULL, '2026-06-02 13:51:50.426087+00', '2026-06-02 13:51:50.426087+00'),
	('2e0dc476-8ace-48fb-81fe-553a80a17ac4', '81ea0d77-218a-4038-8b7c-170029dc487e', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', 'ACTIVE', NULL, NULL, NULL, '2026-06-02 17:15:57.608+00', NULL, '2026-06-02 17:15:57.271649+00', '2026-06-02 17:15:57.271649+00'),
	('44d51de2-6a1c-4e62-94eb-1eb95307e9b1', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', 'b7191868-9541-4c2a-92d8-8eacf232ae7b', 'ACTIVE', NULL, NULL, NULL, '2026-06-27 14:58:54.92+00', NULL, '2026-06-27 14:58:54.668935+00', '2026-06-27 14:58:54.668935+00');


--
-- Data for Name: bill_splits; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."bill_splits" ("id", "connection_id", "created_by", "title", "description", "total_amount", "currency", "is_settled", "created_at", "updated_at") VALUES
	('82799f03-d59a-4bc6-b510-02844f375f68', '330275d3-6720-4d35-bd3f-7867813de377', '11111111-0001-0001-0001-000000000001', 'Test', NULL, 5000000, 'NGN', false, '2026-06-02 18:27:58.276375+00', '2026-06-02 18:27:58.276375+00');


--
-- Data for Name: bill_split_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."bill_split_items" ("id", "split_id", "user_id", "description", "amount", "is_paid", "paid_at", "created_at", "proof_url", "amount_paid", "payment_status") VALUES
	('b0ed1ea5-1c9f-47fb-9a86-9196fc7f0eb9', '82799f03-d59a-4bc6-b510-02844f375f68', '11111111-0001-0001-0001-000000000001', NULL, 2500000, false, NULL, '2026-06-02 18:27:58.594235+00', NULL, NULL, 'unpaid'),
	('debb5c8a-ed46-42ba-a24a-b905ae35d117', '82799f03-d59a-4bc6-b510-02844f375f68', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', NULL, 2500000, false, NULL, '2026-06-02 18:27:58.594235+00', NULL, NULL, 'unpaid');


--
-- Data for Name: blocks; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: housing_platforms; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."housing_platforms" ("id", "name", "description", "url", "logo_url", "cities", "campus_tags", "contact_name", "contact_email", "contact_phone", "status", "is_featured", "registered_by", "total_clicks", "total_referrals", "created_at", "updated_at") VALUES
	('8b242163-7454-422d-b6b9-07a818905dc7', 'AbujaStudentPad', 'Affordable rooms near UniAbuja and BAZE', 'https://example.com/abujapad', NULL, '{Abuja}', '{UNIABUJA,BAZE}', NULL, 'hello@abujapad.ng', NULL, 'PENDING_REVIEW', false, NULL, 0, 0, '2026-06-07 16:25:04.243992+00', '2026-06-07 16:25:04.243992+00'),
	('c335d131-2ad3-4142-a2a1-5510e6fa1310', 'UniCrib Ibadan', 'Hostels and self-cons near UI and LAUTECH', 'https://example.com/unicrib', NULL, '{Ibadan}', '{UI,LAUTECH}', NULL, 'info@unicrib.ng', NULL, 'PENDING_REVIEW', false, NULL, 0, 0, '2026-06-07 16:25:04.243992+00', '2026-06-07 16:25:04.243992+00'),
	('0c1b7b9f-bd7d-43e9-86b3-7f3249e0a3f8', 'PortHarcourt Rooms', 'Student rooms near RSU and UniPort', 'https://example.com/phrooms', NULL, '{"Port Harcourt"}', '{RSU,UNIPORT}', NULL, 'rooms@phrooms.ng', NULL, 'PENDING_REVIEW', false, NULL, 0, 0, '2026-06-07 16:25:04.243992+00', '2026-06-07 16:25:04.243992+00'),
	('a76095bc-2b9e-46b4-a2be-c6b5e3ca8f73', 'EnuguStudentHomes', 'UNN and Enugu State student accommodation', 'https://example.com/enuguhomes', NULL, '{Enugu,Nsukka}', '{UNN,ESUT}', NULL, 'contact@enuguhomes.ng', NULL, 'PENDING_REVIEW', false, NULL, 0, 0, '2026-06-07 16:25:04.243992+00', '2026-06-07 16:25:04.243992+00'),
	('0fc3694c-f1c8-4806-9940-39fd559fa8a5', 'UniHousing Lagos', 'Student accommodation near UNILAG and LASU', 'https://example.com/unihousing', NULL, '{Lagos}', '{UNILAG,LASU,Yaba}', NULL, 'contact@unihousing.ng', NULL, 'ACTIVE', false, NULL, 1, 0, '2026-06-07 16:25:04.243992+00', '2026-06-07 16:25:04.243992+00');


--
-- Data for Name: housing_listings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."messages" ("id", "connection_id", "sender_id", "content", "message_type", "image_url", "read_at", "created_at") VALUES
	('52ff0d8d-9e58-4fae-92d7-aeb6ee66007f', '78353e91-269a-4e43-a928-f3d44b7f4eba', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', 'hi Aisha', 'text', NULL, NULL, '2026-06-02 11:53:42.485956+00'),
	('34044801-ba32-416b-bad9-6210d5505518', '330275d3-6720-4d35-bd3f-7867813de377', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', 'hi', 'text', NULL, '2026-06-02 11:56:39.565+00', '2026-06-01 12:48:38.848266+00'),
	('a9aa313f-2024-4eec-aa38-adec755bcf18', '330275d3-6720-4d35-bd3f-7867813de377', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', 'my name is Jamil', 'text', NULL, '2026-06-02 11:56:39.565+00', '2026-06-01 14:20:33.854199+00'),
	('a19ce734-9c77-4978-9dd1-465156738499', '330275d3-6720-4d35-bd3f-7867813de377', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', '{"agreement_id":"97141a1e-d541-4cfd-8301-450c10955046","initiator_name":"Abdullahi  Jamil"}', 'agreement_request', NULL, '2026-06-02 11:56:39.565+00', '2026-06-02 10:31:00.192787+00'),
	('42be5343-48c2-4ca6-be9b-4e38202fdd41', '330275d3-6720-4d35-bd3f-7867813de377', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', '/agree', 'text', NULL, '2026-06-02 11:56:39.565+00', '2026-06-02 10:31:37.961544+00'),
	('dddb7a3f-80c2-4f2e-b8ba-33f6a30848ce', '330275d3-6720-4d35-bd3f-7867813de377', '11111111-0001-0001-0001-000000000001', 'How far', 'text', NULL, '2026-06-02 11:57:37.34+00', '2026-06-02 11:57:22.72696+00'),
	('fc823b95-f61e-4577-8a06-ae998459d510', '330275d3-6720-4d35-bd3f-7867813de377', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', 'i de oo , wasssup', 'text', NULL, '2026-06-02 11:57:59.84+00', '2026-06-02 11:57:55.174175+00'),
	('9c961e8c-6a2f-4ee7-a64d-e64739626a0f', '7a3c4ac1-3bc0-4d2c-b772-8f7eb966c303', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', 'How far  , Halima 

my name is Jamil .. from SWE', 'text', NULL, NULL, '2026-06-02 13:52:34.947173+00'),
	('bd59c2c3-041e-4bc0-a3de-70721e25e376', '7a3c4ac1-3bc0-4d2c-b772-8f7eb966c303', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', '{"agreement_id":"c575cb0c-50a7-4b9a-89f2-f563c36e3bdf","initiator_name":"Abdullahi  Jamil"}', 'agreement_request', NULL, NULL, '2026-06-02 13:52:58.491083+00'),
	('657a02d6-2d44-4671-8d6e-4c6daabca45f', '330275d3-6720-4d35-bd3f-7867813de377', '11111111-0001-0001-0001-000000000001', '{"agreement_id":"97141a1e-d541-4cfd-8301-450c10955046","declined_by_name":"Amara Okafor"}', 'agreement_declined', NULL, '2026-06-02 14:59:11.266+00', '2026-06-02 14:58:18.084816+00'),
	('a02f65c2-f34d-4ecd-869d-1fb88e9a3316', '330275d3-6720-4d35-bd3f-7867813de377', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', '{"agreement_id":"97141a1e-d541-4cfd-8301-450c10955046","initiator_name":"Abdullahi  Jamil"}', 'agreement_request', NULL, '2026-06-02 14:59:22.413+00', '2026-06-02 14:59:21.717927+00'),
	('9d59f06b-8a08-4fff-9d01-0d5ec0c8d421', '330275d3-6720-4d35-bd3f-7867813de377', '11111111-0001-0001-0001-000000000001', '{"agreement_id":"97141a1e-d541-4cfd-8301-450c10955046","acceptor_name":"Amara Okafor"}', 'agreement_confirmed', NULL, '2026-06-02 15:21:48.553+00', '2026-06-02 15:20:31.704412+00'),
	('f9f5270c-6d8b-4313-988a-07a244ec5262', '2e0dc476-8ace-48fb-81fe-553a80a17ac4', '81ea0d77-218a-4038-8b7c-170029dc487e', 'how far', 'text', NULL, '2026-06-02 17:17:28.179+00', '2026-06-02 17:16:29.348638+00'),
	('d7248d14-6027-4aa1-a8a8-ae59786993eb', '2e0dc476-8ace-48fb-81fe-553a80a17ac4', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', 'im good', 'text', NULL, '2026-06-02 17:18:01.388+00', '2026-06-02 17:17:43.491319+00'),
	('5afd2c0e-1c86-4d5f-8dc1-c9cd3c9e67f0', '2e0dc476-8ace-48fb-81fe-553a80a17ac4', '81ea0d77-218a-4038-8b7c-170029dc487e', '{"agreement_id":"7d173b63-7231-46ae-8627-26fb3d4d1469","initiator_name":"Fatimah Bello"}', 'agreement_request', NULL, '2026-06-02 17:18:30.65+00', '2026-06-02 17:18:11.86357+00'),
	('ca178c7a-d943-4333-b78a-b1869355c591', '330275d3-6720-4d35-bd3f-7867813de377', '11111111-0001-0001-0001-000000000001', 'Thanks mann', 'text', NULL, '2026-06-02 18:33:05.892+00', '2026-06-02 18:31:57.585956+00'),
	('e3376a10-9aff-4e9a-a17a-513cbe2d7918', '2e0dc476-8ace-48fb-81fe-553a80a17ac4', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', '{"agreement_id":"7d173b63-7231-46ae-8627-26fb3d4d1469","acceptor_name":"Abdullahi  Jamil"}', 'agreement_confirmed', NULL, '2026-06-02 18:36:29.145+00', '2026-06-02 18:36:22.136947+00'),
	('eb5045bc-4c39-4ba1-95b0-6f8f0ed97f5f', '330275d3-6720-4d35-bd3f-7867813de377', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', '{"event":"item_paid","split_id":"82799f03-d59a-4bc6-b510-02844f375f68","title":"Test","payer_name":"Abdullahi  Jamil","amount_naira":"₦25,000"}', 'bill_split', NULL, '2026-06-02 18:43:35.033+00', '2026-06-02 18:43:21.093079+00'),
	('2b846381-2ccc-4cfe-8369-8d3d4c7989c7', '330275d3-6720-4d35-bd3f-7867813de377', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', '{"event":"item_paid","split_id":"82799f03-d59a-4bc6-b510-02844f375f68","title":"Test","payer_name":"Abdullahi  Jamil","amount_naira":"₦25,000"}', 'bill_split', NULL, '2026-06-02 18:43:35.033+00', '2026-06-02 18:43:21.100334+00'),
	('5602430d-0113-4f42-a82a-ef6fe9794440', '330275d3-6720-4d35-bd3f-7867813de377', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', '{"event":"item_unpaid","split_id":"82799f03-d59a-4bc6-b510-02844f375f68","title":"Test","payer_name":"Abdullahi  Jamil","amount_naira":"₦25,000"}', 'bill_split', NULL, '2026-06-02 18:43:35.033+00', '2026-06-02 18:43:25.334674+00'),
	('4cfd16de-7585-4045-afa8-ae0f481ce684', '330275d3-6720-4d35-bd3f-7867813de377', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', '{"event":"item_unpaid","split_id":"82799f03-d59a-4bc6-b510-02844f375f68","title":"Test","payer_name":"Abdullahi  Jamil","amount_naira":"₦25,000"}', 'bill_split', NULL, '2026-06-02 18:43:35.033+00', '2026-06-02 18:43:26.3474+00'),
	('b3c2c5c4-24ec-4d68-be1b-5042f8512d1e', '330275d3-6720-4d35-bd3f-7867813de377', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', '{"event":"item_paid","split_id":"82799f03-d59a-4bc6-b510-02844f375f68","title":"Test","payer_name":"Abdullahi  Jamil","amount_naira":"₦25,000"}', 'bill_split', NULL, '2026-06-02 18:48:58.616+00', '2026-06-02 18:48:55.767632+00'),
	('e52a26ea-b0eb-4e5f-9e8e-2a53b03ac7ee', '330275d3-6720-4d35-bd3f-7867813de377', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', '{"event":"item_unpaid","split_id":"82799f03-d59a-4bc6-b510-02844f375f68","title":"Test","payer_name":"Abdullahi  Jamil","amount_naira":"₦25,000"}', 'bill_split', NULL, '2026-06-02 18:48:58.616+00', '2026-06-02 18:48:56.8283+00'),
	('b3a9b717-49e8-437d-940a-4e0922212c87', '330275d3-6720-4d35-bd3f-7867813de377', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', '{"event":"item_paid","split_id":"82799f03-d59a-4bc6-b510-02844f375f68","title":"Test","payer_name":"Abdullahi  Jamil","amount_naira":"₦25,000"}', 'bill_split', NULL, '2026-06-02 18:57:12.638+00', '2026-06-02 18:57:04.411867+00'),
	('b01f9318-91df-4da6-9f0f-4258b6b0122b', '330275d3-6720-4d35-bd3f-7867813de377', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', '{"event":"item_unpaid","split_id":"82799f03-d59a-4bc6-b510-02844f375f68","title":"Test","payer_name":"Abdullahi  Jamil","amount_naira":"₦25,000"}', 'bill_split', NULL, '2026-06-02 18:57:12.638+00', '2026-06-02 18:57:06.237421+00'),
	('1f090405-3bb7-4995-ad14-ab18c22ef8bf', '44d51de2-6a1c-4e62-94eb-1eb95307e9b1', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', 'hi', 'text', NULL, NULL, '2026-06-27 14:59:31.165333+00'),
	('3e383797-77f8-42e2-8dba-64eb55f4cecf', '44d51de2-6a1c-4e62-94eb-1eb95307e9b1', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', '{"agreement_id":"494c0ddc-c113-4be0-9c2a-7fbeff7c0a24","initiator_name":"Abdullahi  Jamil"}', 'agreement_request', NULL, NULL, '2026-06-27 14:59:40.488198+00');


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."notifications" ("id", "user_id", "type", "title", "body", "data", "read_at", "created_at") VALUES
	('dc7848dd-1e5b-4da6-aee2-c5af02eb03e3', '11111111-0001-0001-0001-000000000001', 'AGREEMENT_CONFIRMED', 'Housing unlocked', 'Your roommate agreement is confirmed. Housing providers are now unlocked.', '{"agreement_id": "97141a1e-d541-4cfd-8301-450c10955046", "connection_id": "330275d3-6720-4d35-bd3f-7867813de377"}', NULL, '2026-06-02 15:20:32.527568+00'),
	('d880b24b-67e8-44c5-8a9d-f86aad1f8609', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', 'AGREEMENT_CONFIRMED', 'Agreement accepted', 'Amara Okafor accepted your agreement and paid. Housing is unlocked for both of you.', '{"agreement_id": "97141a1e-d541-4cfd-8301-450c10955046", "connection_id": "330275d3-6720-4d35-bd3f-7867813de377"}', NULL, '2026-06-02 15:20:32.527568+00'),
	('00dfd1ef-fd11-40e1-9142-dc27becc2235', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', 'NEW_MESSAGE', 'Fatimah Bello', 'how far', '{"connection_id": "2e0dc476-8ace-48fb-81fe-553a80a17ac4"}', NULL, '2026-06-02 17:16:29.348638+00'),
	('ff458e22-def0-4f35-ab0c-c4362d2c98bf', '81ea0d77-218a-4038-8b7c-170029dc487e', 'NEW_MESSAGE', 'Abdullahi  Jamil', 'im good', '{"connection_id": "2e0dc476-8ace-48fb-81fe-553a80a17ac4"}', NULL, '2026-06-02 17:17:43.491319+00'),
	('3b272f67-1ad8-4725-90c6-b4803018ccdb', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', 'NEW_MESSAGE', 'Amara Okafor', 'Thanks mann', '{"connection_id": "330275d3-6720-4d35-bd3f-7867813de377"}', NULL, '2026-06-02 18:31:57.585956+00'),
	('dc77d4b3-fe8e-415c-b2f3-4eeada6c7808', 'b7191868-9541-4c2a-92d8-8eacf232ae7b', 'NEW_MESSAGE', 'Abdullahi  Jamil', 'hi', '{"connection_id": "44d51de2-6a1c-4e62-94eb-1eb95307e9b1"}', NULL, '2026-06-27 14:59:31.165333+00');


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."payments" ("id", "user_id", "connection_id", "reference", "amount", "status", "payment_channel", "gateway_response", "paid_at", "created_at") VALUES
	('8a046a88-3f78-47b3-b89c-82fd953ee186', '11111111-0001-0001-0001-000000000001', '330275d3-6720-4d35-bd3f-7867813de377', 'elpnenqju4', 200000, 'SUCCESS', 'card', 'Successful', '2026-06-02 15:20:19+00', '2026-06-02 15:20:30.468447+00');


--
-- Data for Name: platform_clicks; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."platform_clicks" ("id", "platform_id", "user_id", "connection_id", "clicked_at") VALUES
	('e44250fd-d83b-488a-911c-5a3ae93f3237', '0fc3694c-f1c8-4806-9940-39fd559fa8a5', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', '330275d3-6720-4d35-bd3f-7867813de377', '2026-06-07 16:33:23.167061+00');


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."posts" ("id", "user_id", "content", "city", "budget_min", "budget_max", "move_in_date", "likes_count", "comments_count", "created_at", "updated_at") VALUES
	('f44c6bce-28e7-44ad-983f-7c66a6019699', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', 'Hello  Test', NULL, NULL, NULL, NULL, 1, 1, '2026-06-01 09:19:30.93121+00', '2026-06-01 09:19:48.89934+00'),
	('e351fbcd-09c7-4a26-8e30-ebbacd82f280', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', 'Hello  World from GIGS Labs', NULL, NULL, NULL, NULL, 0, 0, '2026-06-01 09:20:14.569235+00', '2026-06-01 09:20:14.569235+00'),
	('e64697d0-d5fc-48b6-9424-227be66d45f7', '11111111-0001-0001-0001-000000000001', 'Heyy  guys , Ive found someone', NULL, NULL, NULL, NULL, 0, 0, '2026-06-02 11:58:58.607222+00', '2026-06-02 11:58:58.607222+00'),
	('e95e3548-bc4b-48c9-8d87-7a9294d1ed54', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', 'im looking for a roomate !??', NULL, NULL, NULL, NULL, 1, 2, '2026-06-02 10:46:11.734803+00', '2026-06-02 11:59:16.512813+00'),
	('42a69c43-cf98-4817-b13e-19a9c96c0ae4', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', 'Heyy  mate looking for a roommate!! 

im at danbarre', NULL, NULL, NULL, NULL, 0, 2, '2026-06-02 13:49:45.273946+00', '2026-06-02 17:15:29.040032+00'),
	('ffbfabd4-60a8-440e-98e7-993edbeaeb8e', '81ea0d77-218a-4038-8b7c-170029dc487e', 'Heyy Fateemah here !!', NULL, NULL, NULL, NULL, 1, 0, '2026-06-02 17:15:08.372226+00', '2026-06-27 14:52:22.214556+00'),
	('849b747f-dfb8-4719-8c81-aab1f6f190c0', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', 'Hello  Mukhtar  , Angon Sharifah', NULL, NULL, NULL, NULL, 1, 1, '2026-06-27 14:52:25.745749+00', '2026-06-27 14:53:09.972287+00');


--
-- Data for Name: post_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."post_comments" ("id", "post_id", "user_id", "content", "created_at") VALUES
	('a1bc8462-5b6f-4d8a-a2b2-4ff1f0827076', 'f44c6bce-28e7-44ad-983f-7c66a6019699', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', 'Heyy  there', '2026-06-01 09:19:48.89934+00'),
	('c223f0af-250a-465b-8316-88dbdc32cc03', 'e95e3548-bc4b-48c9-8d87-7a9294d1ed54', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', 'Come and meet  me na', '2026-06-02 10:46:23.92145+00'),
	('17e3e1f5-0b8c-44e6-8ab1-bbc49edaf06d', 'e95e3548-bc4b-48c9-8d87-7a9294d1ed54', '11111111-0001-0001-0001-000000000001', 'Oya na', '2026-06-02 11:59:08.981413+00'),
	('c634912b-4934-4a4e-843d-c953a5132916', '42a69c43-cf98-4817-b13e-19a9c96c0ae4', '11111111-0001-0001-0001-000000000001', 'oya na i get one guy ..', '2026-06-02 13:50:35.516034+00'),
	('b4ce2dc5-e821-43ef-bfca-30ce361b6480', '42a69c43-cf98-4817-b13e-19a9c96c0ae4', '81ea0d77-218a-4038-8b7c-170029dc487e', 'aktive', '2026-06-02 17:15:29.040032+00'),
	('2b2af657-3ea4-45e8-a774-1f2b8aa2acb9', '849b747f-dfb8-4719-8c81-aab1f6f190c0', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', 'Hello  Singel', '2026-06-27 14:53:09.972287+00');


--
-- Data for Name: post_likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."post_likes" ("id", "post_id", "user_id", "created_at") VALUES
	('3a32138c-a423-449d-9bb6-205743402f34', 'f44c6bce-28e7-44ad-983f-7c66a6019699', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', '2026-06-01 09:19:42.850199+00'),
	('5a6fe19c-16a3-4e50-be43-2ccfa1c3f098', 'e95e3548-bc4b-48c9-8d87-7a9294d1ed54', '11111111-0001-0001-0001-000000000001', '2026-06-02 11:59:16.512813+00'),
	('7886b857-6db1-444f-a395-49bf58f34941', 'ffbfabd4-60a8-440e-98e7-993edbeaeb8e', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', '2026-06-27 14:52:22.214556+00'),
	('dbc5eecf-a0be-4645-9d62-f382ed40edc8', '849b747f-dfb8-4719-8c81-aab1f6f190c0', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', '2026-06-27 14:53:02.531676+00');


--
-- Data for Name: push_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: roommate_agreements; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."roommate_agreements" ("id", "connection_id", "initiator_id", "acceptor_id", "status", "payment_reference", "payment_channel", "amount", "created_at", "accepted_at", "paid_at") VALUES
	('c575cb0c-50a7-4b9a-89f2-f563c36e3bdf', '7a3c4ac1-3bc0-4d2c-b772-8f7eb966c303', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', NULL, 'PENDING', NULL, NULL, 200000, '2026-06-02 13:52:57.348014+00', NULL, NULL),
	('97141a1e-d541-4cfd-8301-450c10955046', '330275d3-6720-4d35-bd3f-7867813de377', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', '11111111-0001-0001-0001-000000000001', 'CONFIRMED', 'elpnenqju4', 'card', 200000, '2026-06-02 10:30:59.108722+00', '2026-06-02 15:20:19+00', '2026-06-02 15:20:19+00'),
	('7d173b63-7231-46ae-8627-26fb3d4d1469', '2e0dc476-8ace-48fb-81fe-553a80a17ac4', '81ea0d77-218a-4038-8b7c-170029dc487e', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', 'CONFIRMED', 'z4hk26y8xq', 'card', 200000, '2026-06-02 17:18:11.357119+00', '2026-06-02 18:36:14+00', '2026-06-02 18:36:14+00'),
	('494c0ddc-c113-4be0-9c2a-7fbeff7c0a24', '44d51de2-6a1c-4e62-94eb-1eb95307e9b1', 'e71fa2ef-a1fe-4ea7-8a8f-6be2a02e2ca3', NULL, 'PENDING', NULL, NULL, 200000, '2026-06-27 14:59:39.673677+00', NULL, NULL);


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('receipts', 'receipts', NULL, '2026-06-02 18:49:32.94663+00', '2026-06-02 18:49:32.94663+00', true, false, 5242880, '{image/jpeg,image/png,image/webp,image/heic,image/gif}', NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 67, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict bt1IMpeRW6C1hmUnbE8DKYdrdnBEgAnITa2BsiDWG1W54nTT2NWyWtHJrQK70tn

RESET ALL;
