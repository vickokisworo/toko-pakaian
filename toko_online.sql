--
-- PostgreSQL database dump
--

\restrict YsZ1wBDkYl6nBr9jPCrOtPhPVnTx4u5pIzbdXBm1uo7OOQzsuVmKfpmrrlLNgPN

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
-- Name: kembalikan_stok(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.kembalikan_stok() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Kembalikan stok
    UPDATE products SET stok = stok + OLD.qty WHERE id = OLD.product_id;
    RETURN OLD;
END;
$$;


ALTER FUNCTION public.kembalikan_stok() OWNER TO postgres;

--
-- Name: kurangi_stok(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.kurangi_stok() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    current_stok INTEGER;
BEGIN
    -- Ambil stok saat ini
    SELECT stok INTO current_stok FROM products WHERE id = NEW.product_id;
    
    -- Cek apakah stok mencukupi
    IF current_stok >= NEW.qty THEN
        -- Kurangi stok
        UPDATE products 
        SET stok = stok - NEW.qty 
        WHERE id = NEW.product_id;
    ELSE
        RAISE EXCEPTION 'Stok tidak mencukupi untuk produk ID %', NEW.product_id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.kurangi_stok() OWNER TO postgres;

--
-- Name: update_stok(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_stok() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    current_stok INTEGER;
BEGIN
    -- Kembalikan stok lama
    UPDATE products SET stok = stok + OLD.qty WHERE id = OLD.product_id;
    
    -- Kurangi stok baru
    SELECT stok INTO current_stok FROM products WHERE id = NEW.product_id;
    
    IF current_stok >= NEW.qty THEN
        UPDATE products SET stok = stok - NEW.qty WHERE id = NEW.product_id;
    ELSE
        RAISE EXCEPTION 'Stok tidak mencukupi untuk produk ID %', NEW.product_id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_stok() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    nama_kategori character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: transaction_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transaction_items (
    id integer NOT NULL,
    transaction_id integer NOT NULL,
    product_id integer NOT NULL,
    qty integer NOT NULL,
    harga_satuan integer NOT NULL,
    subtotal integer NOT NULL
);


ALTER TABLE public.transaction_items OWNER TO postgres;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    kode_transaksi character varying(20) NOT NULL,
    kasir_id integer NOT NULL,
    total_harga integer NOT NULL,
    jumlah_bayar integer NOT NULL,
    kembalian integer NOT NULL,
    tanggal timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    nama character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'pelanggan'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    refresh_token character varying(255),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'kasir'::character varying, 'pelanggan'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: laporan_penjualan; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.laporan_penjualan AS
 SELECT t.id AS id_transaksi,
    t.kode_transaksi,
    t.tanggal,
    u.nama AS kasir,
    sum(ti.qty) AS total_item,
    sum(ti.subtotal) AS total_harga,
    count(DISTINCT ti.product_id) AS jumlah_produk
   FROM ((public.transactions t
     JOIN public.users u ON ((t.kasir_id = u.id)))
     JOIN public.transaction_items ti ON ((t.id = ti.transaction_id)))
  GROUP BY t.id, t.kode_transaksi, t.tanggal, u.nama
  ORDER BY t.tanggal DESC;


ALTER VIEW public.laporan_penjualan OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    nama_produk character varying(100) NOT NULL,
    deskripsi text,
    harga integer NOT NULL,
    stok integer DEFAULT 0 NOT NULL,
    kategori_id integer NOT NULL,
    gambar character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: transaction_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transaction_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transaction_items_id_seq OWNER TO postgres;

--
-- Name: transaction_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transaction_items_id_seq OWNED BY public.transaction_items.id;


--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transactions_id_seq OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: transaction_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction_items ALTER COLUMN id SET DEFAULT nextval('public.transaction_items_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, nama_kategori, created_at) FROM stdin;
1	Baju	2025-10-13 10:46:59.593756
2	Celana	2025-10-13 10:46:59.593756
3	Jaket	2025-10-13 10:46:59.593756
5	Aksesoris	2025-10-13 10:46:59.593756
6	Celana	2025-10-14 09:40:54.604726
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, nama_produk, deskripsi, harga, stok, kategori_id, gambar, created_at, updated_at) FROM stdin;
6	Jaket Hoodie Hitam	Jaket hoodie dengan bahan fleece tebal	200000	10	3	\N	2025-10-13 10:47:05.736083	2025-10-13 10:47:05.736083
7	Jaket Denim Biru	Jaket denim classic, cocok untuk berbagai gaya	300000	8	3	\N	2025-10-13 10:47:05.736083	2025-10-13 10:47:05.736083
8	Topi Baseball	Topi baseball dengan adjustable strap	50000	40	5	\N	2025-10-13 10:47:05.736083	2025-10-13 10:47:05.736083
2	Kemeja Flanel Kotak	Kemeja flanel hangat untuk gaya kasual	120000	29	1	\N	2025-10-13 10:47:05.736083	2025-10-13 10:47:05.736083
9	Kaos Polos Hitam	Kaos cotton combed 30s	80000	49	1	/	2025-10-13 14:31:55.687879	2025-10-13 14:31:55.687879
3	Celana Jeans Slim Fit	Celana jeans dengan model slim fit, warna biru tua	250000	23	2	\N	2025-10-13 10:47:05.736083	2025-10-13 10:47:05.736083
4	Celana Chino Coklat	Celana chino bahan katun, nyaman untuk aktivitas	180000	17	2	\N	2025-10-13 10:47:05.736083	2025-10-13 10:47:05.736083
1	Kaos Basic Putih	Kaos cotton combed 30s, nyaman dipakai sehari-hari	75000	41	1	\N	2025-10-13 10:47:05.736083	2025-10-13 10:47:05.736083
\.


--
-- Data for Name: transaction_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transaction_items (id, transaction_id, product_id, qty, harga_satuan, subtotal) FROM stdin;
1	1	1	2	75000	150000
2	1	2	1	50000	50000
3	2	9	1	80000	80000
4	2	3	1	250000	250000
5	3	1	2	75000	150000
6	3	3	1	250000	250000
8	4	4	3	18000	54000
10	11	1	5	50000	250000
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, kode_transaksi, kasir_id, total_harga, jumlah_bayar, kembalian, tanggal) FROM stdin;
1	TRX001	9	200000	250000	50000	2025-10-13 14:04:36.97757
2	TRX002	9	330000	400000	70000	2025-10-14 10:59:42.661343
3	TRX003	9	400000	1000000	600000	2025-10-14 11:51:13.374276
4	TRX-20251014-001	9	54000	60000	6000	2025-10-17 10:20:42.07701
11	TRX-20251017-940	9	250000	250000	0	2025-10-17 11:37:24.219119
13	TRX-20251117-858	21	150000	200000	50000	2025-11-17 08:22:30.523733
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, nama, email, password, role, is_active, created_at, updated_at, refresh_token) FROM stdin;
1	Admin Toko	admin@pakaian.com	$2b$10$ExampleHashedPassword	admin	t	2025-10-13 10:46:55.192219	2025-10-13 10:46:55.192219	\N
2	Kasir 1	kasir1@pakaian.com	$2b$10$ExampleHashedPassword	kasir	t	2025-10-13 10:46:55.192219	2025-10-13 10:46:55.192219	\N
3	Budi Santoso	budi@email.com	$2b$10$ExampleHashedPassword	pelanggan	t	2025-10-13 10:46:55.192219	2025-10-13 10:46:55.192219	\N
4	Sari Wijaya	sari@email.com	$2b$10$ExampleHashedPassword	pelanggan	t	2025-10-13 10:46:55.192219	2025-10-13 10:46:55.192219	\N
11	Shin Tae Yong	taeyong@mail.com	$2b$10$gNys.3xy4fLkvCPUpJwHF.dUMRIXc0IHR3sA69XRqQE5fa3Ohg7pa	admin	t	2025-10-14 14:19:53.725711	2025-10-14 14:19:53.725711	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MDUwOTI5NywiZXhwIjoxNzYxMTE0MDk3fQ.Yu32dQXu3EeVRPngXyqcm2VprldBjxBnpQKxlbMTGIk
8	Thom Haye	thehayeway@example.com	$2b$10$0hj4BfG/5TTRoVBg6fOyT.DtxbxlRtfchtsnLmwr0iJ4JtR1cccFa	admin	t	2025-10-13 13:51:11.298184	2025-10-13 13:51:11.298184	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYwNDE0NjU0LCJleHAiOjE3NjEwMTk0NTR9.gCZ9lq3yw51EBpzVCzv2N-iIdWY2FcWc7azxPdbB3SM
7	Jay Idzes	bangjay@example.com	$2b$10$ZCac1aRdHfoWA3ktxyiAxOFQgXwG.ajUPcEirWLjcaoM6DseV0icO	pelanggan	t	2025-10-13 13:35:51.620132	2025-10-13 13:35:51.620132	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Nywicm9sZSI6InBlbGFuZ2dhbiIsImlhdCI6MTc2MDMzNzM3MSwiZXhwIjoxNzYwOTQyMTcxfQ.9dEfdtHMvJgkJVfl2upqr6pGK7tH-tf1-aO3BWoq0uY
12	adminBaru	adminbaru@mail.com	$2b$10$uELKTlvs5CGCjq8feETJOeBn0BNiUXhMkN2LeljD8GW0KLJxvIoDK	admin	t	2025-10-14 14:30:44.086177	2025-10-14 14:30:44.086177	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MDQyNzA1OCwiZXhwIjoxNzYxMDMxODU4fQ.n7ZcrbQFX5wlSdi5J0BniyJyE2xqlWMLMoDZ_1ma9AI
13	Kevin Diks	kevindiks@mail.com	$2b$10$4ruwHAHvq7tZeDISIIg3hOtnau6yEFh7/mnp1KT5wl06tmo6ARo02	admin	t	2025-10-16 09:11:54.513416	2025-10-16 09:11:54.513416	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTMsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MDU4Njc5MCwiZXhwIjoxNzYxMTkxNTkwfQ.cpxqjlMaLE4VGkFCJEb4FHd4bK2CjKJSF-ODe3pIg1U
15	Admin Baru	adminnew@mail.com	$2b$10$spFqFGuCsHPDlVgIgm2equ4pUcXEHv4KznyfbWUX.3fnpovy1udim	admin	t	2025-10-17 09:58:46.176375	2025-10-17 09:58:46.176375	\N
16	Erick	erik@mail.com	$2b$10$bmRlxw3.JKdB2KQBaZ.QJOPU7pZlem0/VXtGUcnK4C6dRrnF0VIlC	admin	t	2025-10-17 10:38:26.886567	2025-10-17 10:38:26.886567	\N
19	Coba	coba@mail.com	$2b$10$uFazgAn5MGDVd4VibF14m.MesIBqowJq/CuT01VyHJbgeGk1ZVlAa	admin	t	2025-11-16 19:25:13.594501	2025-11-16 19:25:13.594501	\N
9	Mees Hilgers	meeshilgers@example.com	$2b$10$Xcr19YG3woRrmtQkOdwBQ.9ocBDeObJ/8YXJwq0JG6DMdQKWcYcBi	kasir	t	2025-10-13 13:56:25.368741	2025-10-13 13:56:25.368741	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwicm9sZSI6Imthc2lyIiwiaWF0IjoxNzYwNDk3NzgyLCJleHAiOjE3NjExMDI1ODJ9.Hmqo7TVY1_LqSXojzIOB0DSuWHfLYj2Qv3Ka9wSlnJw
21	Kasir Baru	kasirbaru@mail.com	$2b$10$xDRlWHsauJIg4edaMzRP/OeNLFOMN/tz4Y6QTqPJAi3hyHaqIyOh6	kasir	t	2025-11-17 08:16:55.367449	2025-11-17 08:16:55.367449	\N
\.


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 10, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 15, true);


--
-- Name: transaction_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transaction_items_id_seq', 14, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transactions_id_seq', 13, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 21, true);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: transaction_items transaction_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction_items
    ADD CONSTRAINT transaction_items_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_kode_transaksi_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_kode_transaksi_key UNIQUE (kode_transaksi);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: transaction_items after_delete_transaction_item; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER after_delete_transaction_item AFTER DELETE ON public.transaction_items FOR EACH ROW EXECUTE FUNCTION public.kembalikan_stok();


--
-- Name: transaction_items after_insert_transaction_item; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER after_insert_transaction_item AFTER INSERT ON public.transaction_items FOR EACH ROW EXECUTE FUNCTION public.kurangi_stok();


--
-- Name: transaction_items after_update_transaction_item; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER after_update_transaction_item AFTER UPDATE ON public.transaction_items FOR EACH ROW EXECUTE FUNCTION public.update_stok();


--
-- Name: products products_kategori_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_kategori_id_fkey FOREIGN KEY (kategori_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: transaction_items transaction_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction_items
    ADD CONSTRAINT transaction_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: transaction_items transaction_items_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction_items
    ADD CONSTRAINT transaction_items_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_kasir_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_kasir_id_fkey FOREIGN KEY (kasir_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict YsZ1wBDkYl6nBr9jPCrOtPhPVnTx4u5pIzbdXBm1uo7OOQzsuVmKfpmrrlLNgPN

