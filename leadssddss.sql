--
-- PostgreSQL database dump
--

-- Dumped from database version 16.11 (74c6bb6)
-- Dumped by pg_dump version 17.5

-- Started on 2026-01-06 11:48:01

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 16480)
-- Name: agents; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.agents (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    role text DEFAULT 'agent'::text NOT NULL,
    avatar text,
    password text NOT NULL
);


ALTER TABLE public.agents OWNER TO neondb_owner;

--
-- TOC entry 216 (class 1259 OID 16486)
-- Name: agents_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.agents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.agents_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3352 (class 0 OID 0)
-- Dependencies: 216
-- Name: agents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.agents_id_seq OWNED BY public.agents.id;


--
-- TOC entry 217 (class 1259 OID 16487)
-- Name: leads; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.leads (
    id integer NOT NULL,
    name text NOT NULL,
    company text NOT NULL,
    email text NOT NULL,
    phone text,
    alternate_phone text,
    status text DEFAULT 'new'::text NOT NULL,
    temperature text DEFAULT 'warm'::text NOT NULL,
    value integer DEFAULT 0 NOT NULL,
    last_contact timestamp without time zone DEFAULT now(),
    next_followup timestamp without time zone,
    followup_note text,
    owner_id integer,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.leads OWNER TO neondb_owner;

--
-- TOC entry 218 (class 1259 OID 16497)
-- Name: leads_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.leads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leads_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3353 (class 0 OID 0)
-- Dependencies: 218
-- Name: leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.leads_id_seq OWNED BY public.leads.id;


--
-- TOC entry 3185 (class 2604 OID 16498)
-- Name: agents id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.agents ALTER COLUMN id SET DEFAULT nextval('public.agents_id_seq'::regclass);


--
-- TOC entry 3187 (class 2604 OID 16499)
-- Name: leads id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leads ALTER COLUMN id SET DEFAULT nextval('public.leads_id_seq'::regclass);


--
-- TOC entry 3343 (class 0 OID 16480)
-- Dependencies: 215
-- Data for Name: agents; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.agents (id, name, email, role, avatar, password) FROM stdin;
10	Riya	iexamworld@gmail.com	agent	\N	$2b$10$sFI5caHQJaPXQIO/fctLCuMWmeBFyrnK.UFww4hBhMW92znQIRhkG
7	Admin	admin	admin	\N	$2b$10$d5qLlHDlyQ9z543Em3RRwOZUlZEO/ZoIcsXIVwVx/ZkPIBq3GMCta
\.


--
-- TOC entry 3345 (class 0 OID 16487)
-- Dependencies: 217
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.leads (id, name, company, email, phone, alternate_phone, status, temperature, value, last_contact, next_followup, followup_note, owner_id, created_at) FROM stdin;
47	Govind Ballabh Pandey	Lic Do	gb09410162124@gmail.com	9410162124	\N	new	warm	0	2025-12-31 09:35:24.018263	2025-12-31 15:04:00	already sent sample , ring	10	2025-12-31 09:35:24.018263
48	shubhodeep mukherjee	Lic Do	shubhomdgr@yahoo.co.in	9406346677	\N	new	warm	0	2025-12-31 09:37:49.423249	2025-12-31 15:07:00	already share sample / still busy call letter	10	2025-12-31 09:37:49.423249
40	AKHTAR AHMAD	Trainer	akhtar.ahmad100@gmail.com	9006233899	\N	new	warm	0	2025-12-30 11:23:24.594093	2025-12-30 16:52:00	sahre sample already he will try to see	10	2025-12-30 11:23:24.594093
46	Gourab Prosad	Lic Do	gaurab.babai@gmail.com	9800434643	\N	contacted	cold	0	2025-12-31 09:34:26.688939	2026-01-05 14:05:00	he is not lic do / but convey some other client 	10	2025-12-31 09:34:26.688939
42	VISHNU KUMAR	Lic Do	guptavishnuk@gmail.com	9216330966	\N	new	warm	0	2025-12-30 12:14:48.513895	2026-01-07 13:22:00	share sample / today again resend demo he forgot 	10	2025-12-30 12:14:48.513895
50	shobhit raj	Lic Do	shobhit.licdo@gmail.com	7070703427	\N	new	cold	0	2025-12-31 09:41:51.596823	2026-01-06 12:18:00	already Share Sample/demo / not now / ring cut	10	2025-12-31 09:41:51.596823
32	rajib kumar guha	Lic Do	rajib.guha4@gmail.com	8910827855	\N	new	warm	0	2025-12-30 07:00:51.201835	2026-04-26 12:30:00	call for final confirmation he is ready to make	10	2025-12-30 07:00:51.201835
39	KP Kushwaha	Lic Do	kpkushwaha65@gmail.com	9546157521	\N	proposal	cold	0	2025-12-30 11:03:52.414708	2026-01-06 13:33:00	share already same / ring / again send demo 	10	2025-12-30 11:03:52.414708
23	S. Prakash	DO	sprj.25@gmail.com	8877427421	\N	proposal	cold	0	2025-12-25 12:59:54.836874	2026-01-06 12:50:00	he will decide within 2,3 days /cut the call	10	2025-12-25 12:59:54.836874
22	Manoj Kumar	DO	manoj273001@gmail.com	9918688414	\N	proposal	warm	0	2025-12-25 12:57:52.331796	2026-01-07 11:40:00	final confirmation on 7 jan 2026 / share all imp details	10	2025-12-25 12:57:52.331796
37	Sunil Mishra	Lic Do	sunilmishralic@gmail.com	9404112590	\N	new	cold	0	2025-12-30 09:02:12.245509	2026-01-06 13:15:00	share already sample he have time issue / ring 	10	2025-12-30 09:02:12.245509
29	sagar bindu mohapatra	DO	sagarvindumohapatra@gmail.com	9338386767	\N	contacted	warm	0	2025-12-26 07:55:56.115409	2026-01-05 13:18:00	already sent demo/ call for final confirmation/ he selected 1 , 2 demo both mix he want 	10	2025-12-26 07:55:56.115409
24	Nitish	DO	nitishsaini26@gmail.com	9888064131	\N	new	cold	0	2025-12-25 13:01:57.332645	2026-01-06 13:15:00	he will decide / share things liked by him / ring cut	10	2025-12-25 13:01:57.332645
35	p maridiyya	DO	pmd151569d@gmail.com	9848952981	\N	closed	cold	0	2025-12-30 08:51:50.696774	2026-01-06 14:21:00	lang issue only telgu	10	2025-12-30 08:51:50.696774
43	ANAND HANAGADKAR	Lic Do	anandsh.lic@gmail.com	9480738589	\N	new	cold	0	2025-12-30 12:17:32.91174	2026-01-06 13:25:00	share demo today/ ring 	10	2025-12-30 12:17:32.91174
26	Anuj singh	DO	cchd4u@gmail.com	8076995299	\N	contacted	cold	0	2025-12-25 13:15:28.391481	2026-01-06 17:00:00	call for final review / Cut the call / ring 	10	2025-12-25 13:15:28.391481
33	Vijay Lahane	Lic Do	vijayg.lahane@yahoo.com	9422215825	\N	proposal	cold	0	2025-12-30 07:43:04.199809	2026-01-06 17:48:00	Send again demo 23 dec / busy ring	10	2025-12-30 07:43:04.199809
45	partha pratim	Lic Do	parthapratimpk3@gmail.com	9002844297	\N	proposal	warm	0	2025-12-30 12:22:33.412947	2025-12-31 17:52:00	ring	10	2025-12-30 12:22:33.412947
44	Anil Kr Jha	Lic Do	jhaak98@yahoo.com	9835115638	\N	proposal	warm	0	2025-12-30 12:18:56.582211	2026-01-06 17:48:00	ring	10	2025-12-30 12:18:56.582211
41	suresh appana	Lic Do	appanasuresh66@gmail.com	9441324222	\N	closed	cold	0	2025-12-30 12:12:32.313996	2026-01-05 13:06:00	Not In Anymore	10	2025-12-30 12:12:32.313996
27	rupak gorai	DO	rupakgorai@gmail.com	7797911911	\N	proposal	cold	0	2025-12-26 07:38:05.903431	2026-02-16 18:00:00	remind him 16 feb 2026 he is busy now 	10	2025-12-26 07:38:05.903431
58	Krishna Sarkar	Lic Do	sarkarboi94@gmail.com	7908156750	\N	new	cold	0	2026-01-05 12:38:56.302149	2026-01-06 18:08:00	ring cut 	10	2026-01-05 12:38:56.302149
55	Jagdish Roy Dakua	Lic Do	jagadishmtb@gmail.com	9932564630	\N	new	cold	0	2026-01-05 12:18:07.279999	2026-01-06 17:47:00	ring 	10	2026-01-05 12:18:07.279999
52	Debabrata Das	DO	debabratadas606@gmail.com	8972803898	\N	proposal	cold	0	2026-01-05 10:02:23.480746	2026-01-05 15:31:00	share sample 	10	2026-01-05 10:02:23.480746
31	sachin shaw	Lic Do	sachin.shaw2002@gmail.com	9831956283	\N	contacted	cold	0	2025-12-30 06:59:06.029837	2026-01-10 12:28:00	final confirmation he have already domain/ he will call self 	10	2025-12-30 06:59:06.029837
25	Goutam Sarkar	DO	goutam.sarkar3000@gmail.com	7585972922	\N	proposal	warm	0	2025-12-25 13:09:57.864363	2026-01-10 16:20:00	call now jan 10 he is bit interested	10	2025-12-25 13:09:57.864363
36	Sunil Mishra	Lic Do	sunilmishralic@gmail.com	7719068685	\N	proposal	cold	0	2025-12-30 09:01:04.961817	2026-01-06 14:30:00	share sample / ring	10	2025-12-30 09:01:04.961817
21	Dharmadas	DO	dharmadaspaikar86@gmail.com	9732747095	\N	proposal	warm	0	2025-12-25 12:52:10.034843	2026-01-06 13:09:00	he will check again nd then confirm/ cut the call 	10	2025-12-25 12:52:10.034843
49	SATYENDER KUMAE	Lic Do	satyendrakmr83@gmail.com	9934276970	\N	proposal	warm	0	2025-12-31 09:40:13.776834	2026-01-05 17:09:00	Share Sample/demo / ring / busy right now call back 	10	2025-12-31 09:40:13.776834
38	biswarup manna	Lic Do	mannabiswarup67@gmail.com	8001877088	\N	proposal	cold	0	2025-12-30 09:41:10.026225	2026-01-05 15:10:00	he need time for website but he will/ he will call self no time yet confirm 	10	2025-12-30 09:41:10.026225
57	Pranjal Konwar	Lic Do	pranjalkonwar34@gmail.com	9365665254	\N	proposal	warm	0	2026-01-05 12:35:55.51282	2026-01-06 18:04:00	Share Sample/demo with Him 	10	2026-01-05 12:35:55.51282
53	Kali Kant Jha 	Lic Do	kkjha05@gmail.com	9911910284	\N	new	cold	0	2026-01-05 12:07:07.190722	2026-01-06 17:36:00	Share Sample/demo / cut call 	10	2026-01-05 12:07:07.190722
56	Sunil Mishra	Lic Do	sunilmishralic@gmail.com	9404112590	\N	new	warm	0	2026-01-05 12:20:42.926356	2026-01-05 17:50:00	Share Sample/demo / 8 bje today 	10	2026-01-05 12:20:42.926356
51	Tapas Kumar Das 	Relinence life 	tapasdas054@gmail.com	8455917440	\N	contacted	cold	0	2026-01-05 06:23:18.051719	2026-01-30 12:52:00	Already send demo / domain / he will take take still 	10	2026-01-05 06:23:18.051719
59	Tapas Balo	Lic Do	tapaslic1003@gmail.com	9832033250	\N	new	cold	0	2026-01-05 12:41:04.630528	2026-02-16 18:10:00	Share Sample/demo with Him/ contact after 14 feb 	10	2026-01-05 12:41:04.630528
34	Suresh Kumar Yadav	Lic Do	liccodmkt@gmail.com	8081865531	\N	proposal	cold	0	2025-12-30 08:49:10.88227	2026-01-06 14:18:00	ring / share sample	10	2025-12-30 08:49:10.88227
60	Pankaj Yadav	Lic Do	pankajydv@yahoo.in	9864374709	\N	new	cold	0	2026-01-05 12:42:45.348393	2026-01-06 18:12:00	Share Sample/demo with Him/ ring 	10	2026-01-05 12:42:45.348393
61	Mukesh kumar	Lic Do	mukesh1421988@gmail.com	9955254800	\N	new	cold	0	2026-01-05 12:43:58.224139	2026-01-06 18:13:00	Share Sample/demo with Him/ swiched off 	10	2026-01-05 12:43:58.224139
62	sunilgarnaik	Lic Do	sunilgarnaik@gmail.com	7873360550	\N	new	cold	0	2026-01-05 12:46:19.302009	2026-01-06 18:16:00	ring cut 	10	2026-01-05 12:46:19.302009
63	vedprakash gupta	Lic Do	ved4966@gmail.com	9450265339	\N	new	cold	0	2026-01-05 12:47:52.310201	2026-01-06 18:17:00	ring cut 	10	2026-01-05 12:47:52.310201
54	sanajy kumar singh	Lic Do	sanjay0004786@gmail.com	7376118586	\N	proposal	cold	0	2026-01-05 12:10:02.469592	2026-01-06 17:38:00	ring 	10	2026-01-05 12:10:02.469592
28	J P SINGH	DO	jpsinghsba@gmail.com	8433146400	\N	proposal	cold	0	2025-12-26 07:48:59.726068	2026-01-06 13:00:00	share demo / call next for confirmation / bit intersted / ring 	10	2025-12-26 07:48:59.726068
30	Kailashben Hirpara	Tata AiA Do	d2ainvestment@gmail.com	9924465653	\N	proposal	cold	0	2025-12-26 09:44:39.897431	2026-01-06 13:00:00	he will check demo today / ring	10	2025-12-26 09:44:39.897431
64	Umakant Singh	Lic Do	ukbaruane@gmail.com	9097727821	\N	closed	cold	0	2026-01-05 12:50:47.133121	2026-01-06 18:20:00	Not Need 	10	2026-01-05 12:50:47.133121
65	VISHNU KUMAR	Lic Do	guptavishnuk@gmail.com	9216330966	\N	new	cold	0	2026-01-05 12:55:31.116433	2026-01-06 18:25:00	Share Sample/demo 	10	2026-01-05 12:55:31.116433
66	DIPAK KUMAR KARJEE	Lic Do	karjeedipakkr@gmail.com	9679380551	\N	proposal	cold	0	2026-01-05 13:08:41.706517	2026-01-06 18:30:00	Share Sample/demo 	10	2026-01-05 13:08:41.706517
\.


--
-- TOC entry 3354 (class 0 OID 0)
-- Dependencies: 216
-- Name: agents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.agents_id_seq', 10, true);


--
-- TOC entry 3355 (class 0 OID 0)
-- Dependencies: 218
-- Name: leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.leads_id_seq', 66, true);


--
-- TOC entry 3194 (class 2606 OID 16501)
-- Name: agents agents_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT agents_email_key UNIQUE (email);


--
-- TOC entry 3196 (class 2606 OID 16503)
-- Name: agents agents_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT agents_pkey PRIMARY KEY (id);


--
-- TOC entry 3198 (class 2606 OID 16505)
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- TOC entry 3199 (class 2606 OID 16506)
-- Name: leads leads_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.agents(id);


--
-- TOC entry 2044 (class 826 OID 16394)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- TOC entry 2043 (class 826 OID 16393)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO neon_superuser WITH GRANT OPTION;


-- Completed on 2026-01-06 11:48:25

--
-- PostgreSQL database dump complete
--

