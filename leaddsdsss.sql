--
-- PostgreSQL database dump
--

-- Dumped from database version 16.11 (74c6bb6)
-- Dumped by pg_dump version 17.5

-- Started on 2026-01-03 12:52:47

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
-- TOC entry 6 (class 2615 OID 24576)
-- Name: _system; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA _system;


ALTER SCHEMA _system OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 221 (class 1259 OID 24578)
-- Name: replit_database_migrations_v1; Type: TABLE; Schema: _system; Owner: neondb_owner
--

CREATE TABLE _system.replit_database_migrations_v1 (
    id bigint NOT NULL,
    build_id text NOT NULL,
    deployment_id text NOT NULL,
    statement_count bigint NOT NULL,
    applied_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE _system.replit_database_migrations_v1 OWNER TO neondb_owner;

--
-- TOC entry 220 (class 1259 OID 24577)
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE; Schema: _system; Owner: neondb_owner
--

CREATE SEQUENCE _system.replit_database_migrations_v1_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE _system.replit_database_migrations_v1_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3365 (class 0 OID 0)
-- Dependencies: 220
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE OWNED BY; Schema: _system; Owner: neondb_owner
--

ALTER SEQUENCE _system.replit_database_migrations_v1_id_seq OWNED BY _system.replit_database_migrations_v1.id;


--
-- TOC entry 216 (class 1259 OID 16480)
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
-- TOC entry 217 (class 1259 OID 16486)
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
-- TOC entry 3366 (class 0 OID 0)
-- Dependencies: 217
-- Name: agents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.agents_id_seq OWNED BY public.agents.id;


--
-- TOC entry 218 (class 1259 OID 16487)
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
-- TOC entry 219 (class 1259 OID 16496)
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
-- TOC entry 3367 (class 0 OID 0)
-- Dependencies: 219
-- Name: leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.leads_id_seq OWNED BY public.leads.id;


--
-- TOC entry 3199 (class 2604 OID 24581)
-- Name: replit_database_migrations_v1 id; Type: DEFAULT; Schema: _system; Owner: neondb_owner
--

ALTER TABLE ONLY _system.replit_database_migrations_v1 ALTER COLUMN id SET DEFAULT nextval('_system.replit_database_migrations_v1_id_seq'::regclass);


--
-- TOC entry 3191 (class 2604 OID 16497)
-- Name: agents id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.agents ALTER COLUMN id SET DEFAULT nextval('public.agents_id_seq'::regclass);


--
-- TOC entry 3193 (class 2604 OID 16498)
-- Name: leads id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leads ALTER COLUMN id SET DEFAULT nextval('public.leads_id_seq'::regclass);


--
-- TOC entry 3359 (class 0 OID 24578)
-- Dependencies: 221
-- Data for Name: replit_database_migrations_v1; Type: TABLE DATA; Schema: _system; Owner: neondb_owner
--

COPY _system.replit_database_migrations_v1 (id, build_id, deployment_id, statement_count, applied_at) FROM stdin;
1	dd307faa-6c94-427c-b21b-e10dcf690ded	e68e718f-a05e-4540-9c7a-2afc75cca223	1	2025-12-25 11:24:24.1881+00
\.


--
-- TOC entry 3354 (class 0 OID 16480)
-- Dependencies: 216
-- Data for Name: agents; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.agents (id, name, email, role, avatar, password) FROM stdin;
10	Riya	iexamworld@gmail.com	agent	\N	$2b$10$sFI5caHQJaPXQIO/fctLCuMWmeBFyrnK.UFww4hBhMW92znQIRhkG
7	Admin	admin	admin	\N	$2b$10$d5qLlHDlyQ9z543Em3RRwOZUlZEO/ZoIcsXIVwVx/ZkPIBq3GMCta
\.


--
-- TOC entry 3356 (class 0 OID 16487)
-- Dependencies: 218
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.leads (id, name, company, email, phone, alternate_phone, status, temperature, value, last_contact, next_followup, followup_note, owner_id, created_at) FROM stdin;
23	S. Prakash	DO	sprj.25@gmail.com	8877427421	\N	new	hot	0	2025-12-25 12:59:54.836874	2025-12-31 12:50:00	he will decide within 2,3 days /cut the call	10	2025-12-25 12:59:54.836874
34	Suresh Kumar Yadav	Lic Do	liccodmkt@gmail.com	8081865531	\N	new	warm	0	2025-12-30 08:49:10.88227	2025-12-31 14:18:00	ring / share sample 	10	2025-12-30 08:49:10.88227
35	p maridiyya	DO	pmd151569d@gmail.com	9848952981	\N	new	warm	0	2025-12-30 08:51:50.696774	2025-12-30 14:21:00	if need he will think /ring	10	2025-12-30 08:51:50.696774
22	Manoj Kumar	DO	manoj273001@gmail.com	9918688414	\N	new	warm	0	2025-12-25 12:57:52.331796	2026-01-07 11:40:00	final confirmation on 7 jan 2026 / share all imp details	10	2025-12-25 12:57:52.331796
24	Nitish	DO	nitishsaini26@gmail.com	9888064131	\N	new	warm	0	2025-12-25 13:01:57.332645	2026-12-29 00:00:00	he will decide / share things liked by him	10	2025-12-25 13:01:57.332645
46	Gourab Prosad	Lic Do	gaurab.babai@gmail.com	9800434643	\N	new	warm	0	2025-12-31 09:34:26.688939	2025-12-31 15:04:00	busy now call letter	10	2025-12-31 09:34:26.688939
47	Govind Ballabh Pandey	Lic Do	gb09410162124@gmail.com	9410162124	\N	new	warm	0	2025-12-31 09:35:24.018263	2025-12-31 15:04:00	already sent sample , ring 	10	2025-12-31 09:35:24.018263
25	Goutam Sarkar	DO	goutam.sarkar3000@gmail.com	7585972922	\N	new	warm	0	2025-12-25 13:09:57.864363	2026-01-10 16:20:00	call now jan 10 he is bit interested 	10	2025-12-25 13:09:57.864363
29	sagar bindu mohapatra	DO	sagarvindumohapatra@gmail.com	9338386767	\N	new	hot	0	2025-12-26 07:55:56.115409	2026-01-02 12:00:00	he liked 2. 3 demo he want mix them / call for final confirmation 	10	2025-12-26 07:55:56.115409
26	Anuj singh	DO	cchd4u@gmail.com	8076995299	\N	new	warm	0	2025-12-25 13:15:28.391481	2026-01-02 17:00:00	call for final review / Cut the call	10	2025-12-25 13:15:28.391481
31	sachin shaw	Lic Do	sachin.shaw2002@gmail.com	9831956283	\N	new	hot	0	2025-12-30 06:59:06.029837	2026-01-01 12:28:00	final confirmation he have already domain 	10	2025-12-30 06:59:06.029837
32	rajib kumar guha	Lic Do	rajib.guha4@gmail.com	8910827855	\N	new	warm	0	2025-12-30 07:00:51.201835	2026-04-26 12:30:00	call for final confirmation he is ready to make 	10	2025-12-30 07:00:51.201835
21	Dharmadas	DO	dharmadaspaikar86@gmail.com	9732747095	\N	new	warm	0	2025-12-25 12:52:10.034843	2025-12-31 00:25:00	he will check again nd then confirm 	10	2025-12-25 12:52:10.034843
30	Kailashben Hirpara	Tata AiA Do	d2ainvestment@gmail.com	9924465653	\N	new	warm	0	2025-12-26 09:44:39.897431	2026-01-01 13:00:00	he will check demo today / ring 	10	2025-12-26 09:44:39.897431
48	shubhodeep mukherjee	Lic Do	shubhomdgr@yahoo.co.in	9406346677	\N	new	warm	0	2025-12-31 09:37:49.423249	2025-12-31 15:07:00	already share sample / still busy call letter	10	2025-12-31 09:37:49.423249
27	rupak gorai	DO	rupakgorai@gmail.com	7797911911	\N	new	warm	0	2025-12-26 07:38:05.903431	2024-12-30 18:00:00	remind him 6pm for demo checking 	10	2025-12-26 07:38:05.903431
33	Vijay Lahane	Lic Do	vijayg.lahane@yahoo.com	9422215825	\N	new	warm	0	2025-12-30 07:43:04.199809	2025-12-30 13:12:00	Send again demo 23 dec / busy ring 	10	2025-12-30 07:43:04.199809
36	Sunil Mishra	Lic Do	sunilmishralic@gmail.com	7719068685	\N	new	warm	0	2025-12-30 09:01:04.961817	2025-12-30 14:30:00	share sample / ring 	10	2025-12-30 09:01:04.961817
38	biswarup manna	Lic Do	mannabiswarup67@gmail.com	8001877088	\N	new	warm	0	2025-12-30 09:41:10.026225	2025-12-30 15:10:00	he need time for website but he will	10	2025-12-30 09:41:10.026225
39	KP Kushwaha	Lic Do	kpkushwaha65@gmail.com	9546157521	\N	new	warm	0	2025-12-30 11:03:52.414708	2025-12-31 16:33:00	share already same / ring 	10	2025-12-30 11:03:52.414708
28	J P SINGH	DO	jpsinghsba@gmail.com	8433146400	\N	new	warm	0	2025-12-26 07:48:59.726068	2025-12-31 16:00:00	share demo / call next for confirmation / bit intersted 	10	2025-12-26 07:48:59.726068
37	Sunil Mishra	Lic Do	sunilmishralic@gmail.com	9404112590	\N	new	warm	0	2025-12-30 09:02:12.245509	2025-12-31 14:31:00	share already sample he have time issue 	10	2025-12-30 09:02:12.245509
41	suresh appana	Lic Do	appanasuresh66@gmail.com	9441324222	\N	new	warm	0	2025-12-30 12:12:32.313996	2025-12-31 17:42:00	ring	10	2025-12-30 12:12:32.313996
42	VISHNU KUMAR	Lic Do	guptavishnuk@gmail.com	9216330966	\N	new	warm	0	2025-12-30 12:14:48.513895	2025-12-31 17:44:00	share sample 	10	2025-12-30 12:14:48.513895
43	ANAND HANAGADKAR	Lic Do	anandsh.lic@gmail.com	9480738589	\N	new	warm	0	2025-12-30 12:17:32.91174	2025-12-31 17:47:00	share demo today 	10	2025-12-30 12:17:32.91174
44	Anil Kr Jha	Lic Do	jhaak98@yahoo.com	9835115638	\N	new	warm	0	2025-12-30 12:18:56.582211	2025-12-31 17:48:00	ring	10	2025-12-30 12:18:56.582211
45	partha pratim	Lic Do	parthapratimpk3@gmail.com	9002844297	\N	new	warm	0	2025-12-30 12:22:33.412947	2025-12-31 17:52:00	ring 	10	2025-12-30 12:22:33.412947
40	AKHTAR AHMAD	Trainer 	akhtar.ahmad100@gmail.com	9006233899	\N	new	warm	0	2025-12-30 11:23:24.594093	2025-12-30 16:52:00	sahre sample already he will try to see 	10	2025-12-30 11:23:24.594093
49	SATYENDER KUMAE 	Lic Do	satyendrakmr83@gmail.com	9934276970	\N	new	warm	0	2025-12-31 09:40:13.776834	2025-12-31 15:09:00	Share Sample/demo / ring 	10	2025-12-31 09:40:13.776834
50	shobhit raj	Lic Do	shobhit.licdo@gmail.com	7070703427	\N	new	warm	0	2025-12-31 09:41:51.596823	2025-12-31 16:11:00	already Share Sample/demo / not now	10	2025-12-31 09:41:51.596823
\.


--
-- TOC entry 3368 (class 0 OID 0)
-- Dependencies: 220
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE SET; Schema: _system; Owner: neondb_owner
--

SELECT pg_catalog.setval('_system.replit_database_migrations_v1_id_seq', 1, true);


--
-- TOC entry 3369 (class 0 OID 0)
-- Dependencies: 217
-- Name: agents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.agents_id_seq', 10, true);


--
-- TOC entry 3370 (class 0 OID 0)
-- Dependencies: 219
-- Name: leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.leads_id_seq', 50, true);


--
-- TOC entry 3209 (class 2606 OID 24586)
-- Name: replit_database_migrations_v1 replit_database_migrations_v1_pkey; Type: CONSTRAINT; Schema: _system; Owner: neondb_owner
--

ALTER TABLE ONLY _system.replit_database_migrations_v1
    ADD CONSTRAINT replit_database_migrations_v1_pkey PRIMARY KEY (id);


--
-- TOC entry 3202 (class 2606 OID 16500)
-- Name: agents agents_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT agents_email_unique UNIQUE (email);


--
-- TOC entry 3204 (class 2606 OID 16502)
-- Name: agents agents_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT agents_pkey PRIMARY KEY (id);


--
-- TOC entry 3206 (class 2606 OID 16504)
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- TOC entry 3207 (class 1259 OID 24587)
-- Name: idx_replit_database_migrations_v1_build_id; Type: INDEX; Schema: _system; Owner: neondb_owner
--

CREATE UNIQUE INDEX idx_replit_database_migrations_v1_build_id ON _system.replit_database_migrations_v1 USING btree (build_id);


--
-- TOC entry 3210 (class 2606 OID 16505)
-- Name: leads leads_owner_id_agents_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_owner_id_agents_id_fk FOREIGN KEY (owner_id) REFERENCES public.agents(id);


--
-- TOC entry 2050 (class 826 OID 16394)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- TOC entry 2049 (class 826 OID 16393)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO neon_superuser WITH GRANT OPTION;


-- Completed on 2026-01-03 12:53:11

--
-- PostgreSQL database dump complete
--

