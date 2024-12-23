--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.1

-- Started on 2024-12-23 10:07:34

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
-- TOC entry 224 (class 1259 OID 16493)
-- Name: buy_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.buy_transactions (
    id integer NOT NULL,
    session_id integer,
    solana_wallet_address character varying(100),
    fees bigint,
    solana_tx_signature character varying(150),
    side character varying(10),
    token_price integer,
    buy_token_amount bigint,
    total_in_solana bigint,
    "time" timestamp with time zone,
    tokens_received bigint
);


ALTER TABLE public.buy_transactions OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16492)
-- Name: buy_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.buy_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.buy_transactions_id_seq OWNER TO postgres;

--
-- TOC entry 4883 (class 0 OID 0)
-- Dependencies: 223
-- Name: buy_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.buy_transactions_id_seq OWNED BY public.buy_transactions.id;


--
-- TOC entry 220 (class 1259 OID 16469)
-- Name: claim_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.claim_transactions (
    id integer NOT NULL,
    session_id integer,
    solana_wallet_address character varying(100),
    target_solana_wallet_address character varying(100),
    fees integer,
    solana_tx_signature character varying(150),
    claim_token_amount integer,
    "time" timestamp with time zone,
    sol_received integer,
    burn_tx_signature character varying
);


ALTER TABLE public.claim_transactions OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16468)
-- Name: claim_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.claim_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.claim_transactions_id_seq OWNER TO postgres;

--
-- TOC entry 4884 (class 0 OID 0)
-- Dependencies: 219
-- Name: claim_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.claim_transactions_id_seq OWNED BY public.claim_transactions.id;


--
-- TOC entry 218 (class 1259 OID 16462)
-- Name: game; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.game (
    id integer NOT NULL,
    time_started timestamp with time zone,
    memecoin_name character varying(50),
    contract_address character varying(100),
    memecoin_price_start integer,
    memecoin_price_end integer,
    overunder_price_line integer,
    time_ended timestamp with time zone,
    total_pot bigint,
    over_pot bigint,
    under_pot bigint,
    over_token_minted bigint,
    under_token_minted bigint,
    over_token_burnt bigint,
    under_token_burnt bigint,
    over_price integer,
    under_price integer,
    claimable_winning_pot_in_sol bigint,
    over_token_address character varying,
    under_token_address character varying,
    memecoin_symbol character varying,
    memecoin_usd_start double precision,
    memecoin_usd_end double precision,
    token_decimal integer,
    buy_fee bigint,
    sell_fee bigint,
    over_pot_address character varying,
    under_pot_address character varying
);


ALTER TABLE public.game OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16461)
-- Name: game_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.game_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.game_id_seq OWNER TO postgres;

--
-- TOC entry 4885 (class 0 OID 0)
-- Dependencies: 217
-- Name: game_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.game_id_seq OWNED BY public.game.id;


--
-- TOC entry 222 (class 1259 OID 16481)
-- Name: sell_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sell_transactions (
    id integer NOT NULL,
    session_id integer,
    solana_wallet_address character varying(100),
    fees integer,
    solana_tx_signature character varying(150),
    side character varying(10),
    token_price integer,
    sell_token_amount integer,
    "time" timestamp with time zone,
    sol_received integer,
    progressive_fees integer,
    burn_tx_signature character varying
);


ALTER TABLE public.sell_transactions OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16480)
-- Name: sell_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sell_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sell_transactions_id_seq OWNER TO postgres;

--
-- TOC entry 4886 (class 0 OID 0)
-- Dependencies: 221
-- Name: sell_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sell_transactions_id_seq OWNED BY public.sell_transactions.id;


--
-- TOC entry 4713 (class 2604 OID 16496)
-- Name: buy_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buy_transactions ALTER COLUMN id SET DEFAULT nextval('public.buy_transactions_id_seq'::regclass);


--
-- TOC entry 4711 (class 2604 OID 16472)
-- Name: claim_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_transactions ALTER COLUMN id SET DEFAULT nextval('public.claim_transactions_id_seq'::regclass);


--
-- TOC entry 4710 (class 2604 OID 16465)
-- Name: game id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game ALTER COLUMN id SET DEFAULT nextval('public.game_id_seq'::regclass);


--
-- TOC entry 4712 (class 2604 OID 16484)
-- Name: sell_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sell_transactions ALTER COLUMN id SET DEFAULT nextval('public.sell_transactions_id_seq'::regclass);


--
-- TOC entry 4877 (class 0 OID 16493)
-- Dependencies: 224
-- Data for Name: buy_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.buy_transactions (id, session_id, solana_wallet_address, fees, solana_tx_signature, side, token_price, buy_token_amount, total_in_solana, "time", tokens_received) FROM stdin;
1	11	walletsample	10000000		under	0	0	1000000000	2024-12-22 12:31:37.577+07	0
2	11	walletsample	10000000	txSign	under	1000	0	1000000000	2024-12-22 13:57:21.605+07	0
3	13	walletsample	10000000	txSign1	under	1000000	0	1000000000	2024-12-22 15:35:35.327+07	0
4	13	walletsample	10000000	txSign2	under	1000000	0	1000000000	2024-12-22 15:37:26.364+07	0
5	13	walletsample	10000000	txSign3	under	1000000	0	1000000000	2024-12-22 15:39:36.073+07	0
6	13	EHcZGQPZgn2igSxzRB4dtzSHBTK1kaZj55enbyKWSCCU	10000000	txSign4	under	1000000	0	1000000000	2024-12-22 15:56:12.916+07	0
7	13	EHcZGQPZgn2igSxzRB4dtzSHBTK1kaZj55enbyKWSCCU	10000000	txSign5	under	1000000	0	1000000000	2024-12-22 17:00:43.547+07	0
8	13	EHcZGQPZgn2igSxzRB4dtzSHBTK1kaZj55enbyKWSCCU	10000000	txSign6	under	1000000	0	1000000000	2024-12-22 17:06:27.662+07	0
9	13	EHcZGQPZgn2igSxzRB4dtzSHBTK1kaZj55enbyKWSCCU	10000000	txSign7	under	1000000	0	1000000000	2024-12-22 17:12:47.725+07	0
10	13	EHcZGQPZgn2igSxzRB4dtzSHBTK1kaZj55enbyKWSCCU	10000000	txSign8	under	1000000	0	1000000000	2024-12-22 17:18:45.331+07	0
11	13	EHcZGQPZgn2igSxzRB4dtzSHBTK1kaZj55enbyKWSCCU	10000000	txSign9	under	1000000	0	1000000000	2024-12-22 17:23:28.805+07	0
12	13	EHcZGQPZgn2igSxzRB4dtzSHBTK1kaZj55enbyKWSCCU	10000000	txSign10	under	1000000	0	1000000000	2024-12-22 17:30:34.201+07	0
13	13	EHcZGQPZgn2igSxzRB4dtzSHBTK1kaZj55enbyKWSCCU	10000000	txSign11	under	1000000	0	1000000000	2024-12-22 17:46:21.947+07	0
14	13	EHcZGQPZgn2igSxzRB4dtzSHBTK1kaZj55enbyKWSCCU	10000000	txSign12	under	1000000	0	1000000000	2024-12-22 17:48:05.205+07	0
15	13	EHcZGQPZgn2igSxzRB4dtzSHBTK1kaZj55enbyKWSCCU	10000000	txSign13	under	1000000	0	1000000000	2024-12-22 17:50:04.392+07	0
16	14	EHcZGQPZgn2igSxzRB4dtzSHBTK1kaZj55enbyKWSCCU	10000000	1111	under	1000000	0	1000000000	2024-12-22 19:48:09.351+07	0
\.


--
-- TOC entry 4873 (class 0 OID 16469)
-- Dependencies: 220
-- Data for Name: claim_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.claim_transactions (id, session_id, solana_wallet_address, target_solana_wallet_address, fees, solana_tx_signature, claim_token_amount, "time", sol_received, burn_tx_signature) FROM stdin;
\.


--
-- TOC entry 4871 (class 0 OID 16462)
-- Dependencies: 218
-- Data for Name: game; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.game (id, time_started, memecoin_name, contract_address, memecoin_price_start, memecoin_price_end, overunder_price_line, time_ended, total_pot, over_pot, under_pot, over_token_minted, under_token_minted, over_token_burnt, under_token_burnt, over_price, under_price, claimable_winning_pot_in_sol, over_token_address, under_token_address, memecoin_symbol, memecoin_usd_start, memecoin_usd_end, token_decimal, buy_fee, sell_fee, over_pot_address, under_pot_address) FROM stdin;
10	2024-12-22 08:10:18.796+07	lou	4XkFgQMe24uuwRB1JeYYv1MTQoSsk9Crc6FRhUtAVydx	0	0	0	\N	0	0	0	0	0	0	0	1000	1000	0			lou	0	0	6	\N	\N	\N	\N
11	2024-12-22 11:24:03.442+07	Rick Sanchez	857gasFXFDbji7ef23VLfweDeHvxnx3zEDSZnLVfo45u	0	0	0	\N	0	0	0	0	0	0	0	1000	1000	0			$RICK	0	0	6	\N	\N	\N	\N
12	2024-12-22 14:57:34.105+07	Sol-Up	8CF8vU3iD8MjpGK64mETc3FnLzWJdVRG5kjTyz3bpump	0	0	0	\N	0	0	0	0	0	0	0	1000000	1000000	0	6MLdjziDMWu7FDUci8XLJsYooFBsMMSb7u1zsXRgezfi	5UJB1GyuJXCkt9f9FEQR2zZBo317rHsB7A8ebwj4JweU	SOLUP	0	0	6	0	0	64AQEPp2dRq4C964X8wyzB4sowB3NN67LTR7g8i6ypC86EFHSQSBAM6MDmoDDhUSWMRkhYUW4sPmkhxRdokvVpJs	4GaLxAs2fKP6HYfYwwUCXhVcEX5QduXZA4VdXyB7RkGohYkhcQaBAcv2UqEdYcGaKq5YgUmswHcwZ67pbpA236cP
13	2024-12-22 15:16:17.463+07	loading	9UvuJSr35cLV8CiaD1byACKxGRpDHEyYTiFo3mjoZjJi	0	0	0	\N	2000000000	0	2000000000	0	1980000000000	0	0	1000000	1000000	1980000000	E1MpfAyeEwVCfEjt7KLkd4zZfhVKSWhxVWJiX1TL1zJU	3wkzLUL57yJyCXYkSxoMqSK5LtwbyHFEe2YRh9wyPYzP	loading	0.029563550997887204	0	6	20000000	0	2coGgVV8LGPY28Jz1XPnCBiMTHVdyDQc72fjWgAbmWwCNA7fiMCzBdZgAABM9HndHVtqFcnmA3jc2rauLkuM75C	2hs7hbeQ7W5TtPc3EnYkhdybfmvmNmBp8fW2ErHtkDr76UG7F9w3ZX2w2Ee6koxyX7xpyNozHQuJvqBLtbmURB1M
14	2024-12-22 18:23:03.049+07	Scoutly AI	5NNqU4koTZK2QswkxNynFbN8kdz2LgXA4dbMjaVqGZPe	0	0	0	\N	1000000000	0	1000000000	0	990000000000	0	0	1000000	1000000	990000000	FwL7k1F9JZj534vJXZhfVDjAf1QQD93hBxazFT641Jxm	HjAqXnbHcVq276tJeZ1yxjrzzA9MW3Q7bw3GcoXyBNc5	SCOUT	0.011386216804488303	0	6	10000000	0	49hyxSeFgkqWdkmqSZv3gUeSGbo1kvbJLLU6GmiTMY4fXdXEC43WF7dWKtHZHfSTFk3jSYjmagjPBckAgUjrzKGn	1zMPnjqZtbotNTZaXPQdxuQn1k4RQXPq9JqBCzxdgAYKLFsSrfgLkLPtAgK88h5YpnWN3xoMviNbJ2yKbE4rRk7
\.


--
-- TOC entry 4875 (class 0 OID 16481)
-- Dependencies: 222
-- Data for Name: sell_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sell_transactions (id, session_id, solana_wallet_address, fees, solana_tx_signature, side, token_price, sell_token_amount, "time", sol_received, progressive_fees, burn_tx_signature) FROM stdin;
\.


--
-- TOC entry 4887 (class 0 OID 0)
-- Dependencies: 223
-- Name: buy_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.buy_transactions_id_seq', 16, true);


--
-- TOC entry 4888 (class 0 OID 0)
-- Dependencies: 219
-- Name: claim_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.claim_transactions_id_seq', 1, false);


--
-- TOC entry 4889 (class 0 OID 0)
-- Dependencies: 217
-- Name: game_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.game_id_seq', 14, true);


--
-- TOC entry 4890 (class 0 OID 0)
-- Dependencies: 221
-- Name: sell_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sell_transactions_id_seq', 1, false);


--
-- TOC entry 4721 (class 2606 OID 16498)
-- Name: buy_transactions buy_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buy_transactions
    ADD CONSTRAINT buy_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 4717 (class 2606 OID 16474)
-- Name: claim_transactions claim_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_transactions
    ADD CONSTRAINT claim_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 4715 (class 2606 OID 16467)
-- Name: game game_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game
    ADD CONSTRAINT game_pkey PRIMARY KEY (id);


--
-- TOC entry 4719 (class 2606 OID 16486)
-- Name: sell_transactions sell_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sell_transactions
    ADD CONSTRAINT sell_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 4724 (class 2606 OID 16499)
-- Name: buy_transactions buy_transactions_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buy_transactions
    ADD CONSTRAINT buy_transactions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.game(id) ON DELETE CASCADE;


--
-- TOC entry 4722 (class 2606 OID 16475)
-- Name: claim_transactions claim_transactions_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_transactions
    ADD CONSTRAINT claim_transactions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.game(id) ON DELETE CASCADE;


--
-- TOC entry 4723 (class 2606 OID 16487)
-- Name: sell_transactions sell_transactions_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sell_transactions
    ADD CONSTRAINT sell_transactions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.game(id) ON DELETE CASCADE;


-- Completed on 2024-12-23 10:07:34

--
-- PostgreSQL database dump complete
--

