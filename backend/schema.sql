--
-- PostgreSQL database dump
--

\restrict ORy5V02texLcvY50HrCsEu41AJd1UjaeYKUML5g61mUbKgQrbSiuctQzpjIVDSI

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
-- Name: user_wishlists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_wishlists (
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_wishlists OWNER TO postgres;

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
-- Name: user_wishlists user_wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_wishlists
    ADD CONSTRAINT user_wishlists_pkey PRIMARY KEY (user_id, product_id);


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
-- Name: user_wishlists user_wishlists_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_wishlists
    ADD CONSTRAINT user_wishlists_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: user_wishlists user_wishlists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_wishlists
    ADD CONSTRAINT user_wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ORy5V02texLcvY50HrCsEu41AJd1UjaeYKUML5g61mUbKgQrbSiuctQzpjIVDSI

