--
-- PostgreSQL database dump
--

\restrict lFwT3jLTHdjHdJa03ceBgu21yZjrlV3Sbqtgijkt0T5fS7SDaDs9JpS0vDMRHAY

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-07-14 11:03:48

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
-- TOC entry 2 (class 3079 OID 17670)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 5125 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 872 (class 1247 OID 17682)
-- Name: articles_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.articles_status_enum AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED',
    'SCHEDULED'
);


--
-- TOC entry 920 (class 1247 OID 17955)
-- Name: audit_logs_action_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.audit_logs_action_enum AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE'
);


--
-- TOC entry 905 (class 1247 OID 17832)
-- Name: contacts_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contacts_status_enum AS ENUM (
    'PENDING',
    'RESOLVED'
);


--
-- TOC entry 902 (class 1247 OID 17826)
-- Name: contacts_subject_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contacts_subject_enum AS ENUM (
    'FEEDBACK',
    'LOST_ITEMS'
);


--
-- TOC entry 890 (class 1247 OID 17772)
-- Name: jobs_department_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.jobs_department_enum AS ENUM (
    'HCTC',
    'KHTC',
    'KDQHCC',
    'KTAT',
    'VTTBDV',
    'XNBD',
    'XNVH'
);


--
-- TOC entry 893 (class 1247 OID 17788)
-- Name: jobs_job_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.jobs_job_type_enum AS ENUM (
    'FULL_TIME',
    'PART_TIME',
    'INTERN'
);


--
-- TOC entry 896 (class 1247 OID 17796)
-- Name: jobs_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.jobs_status_enum AS ENUM (
    'OPEN',
    'CLOSED'
);


--
-- TOC entry 884 (class 1247 OID 17744)
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.users_role_enum AS ENUM (
    'ADMIN',
    'EDITOR'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 17687)
-- Name: articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.articles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    title character varying NOT NULL,
    slug character varying NOT NULL,
    summary character varying,
    content text NOT NULL,
    status public.articles_status_enum DEFAULT 'DRAFT'::public.articles_status_enum NOT NULL,
    published_at timestamp without time zone,
    thumbnail_id uuid,
    author_id uuid
);


--
-- TOC entry 229 (class 1259 OID 17961)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    actor_id character varying,
    actor_email character varying NOT NULL,
    action public.audit_logs_action_enum NOT NULL,
    entity_name character varying NOT NULL,
    entity_id character varying NOT NULL,
    old_values jsonb,
    new_values jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 17707)
-- Name: banners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banners (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    title character varying NOT NULL,
    redirect_url character varying,
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    image_id uuid,
    created_by uuid
);


--
-- TOC entry 226 (class 1259 OID 17890)
-- Name: blacklisted_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blacklisted_tokens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 225 (class 1259 OID 17837)
-- Name: contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contacts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    full_name character varying NOT NULL,
    email character varying,
    phone character varying,
    subject public.contacts_subject_enum DEFAULT 'FEEDBACK'::public.contacts_subject_enum NOT NULL,
    message text NOT NULL,
    status public.contacts_status_enum DEFAULT 'PENDING'::public.contacts_status_enum NOT NULL,
    resolved_by uuid
);


--
-- TOC entry 224 (class 1259 OID 17801)
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    title character varying NOT NULL,
    slug character varying NOT NULL,
    department public.jobs_department_enum NOT NULL,
    location character varying,
    job_type public.jobs_job_type_enum NOT NULL,
    description text NOT NULL,
    requirements text NOT NULL,
    benefits text,
    deadline date NOT NULL,
    status public.jobs_status_enum DEFAULT 'OPEN'::public.jobs_status_enum NOT NULL,
    created_by uuid
);


--
-- TOC entry 222 (class 1259 OID 17725)
-- Name: media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    file_name character varying NOT NULL,
    original_name character varying NOT NULL,
    mime_type character varying NOT NULL,
    size integer NOT NULL,
    url character varying NOT NULL,
    uploaded_by uuid
);


--
-- TOC entry 227 (class 1259 OID 17903)
-- Name: stations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    name character varying NOT NULL,
    code character varying NOT NULL,
    content text,
    display_order integer DEFAULT 0 NOT NULL,
    schedule_image_id uuid
);


--
-- TOC entry 228 (class 1259 OID 17930)
-- Name: ticket_fares; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_fares (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    title character varying NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    image_id uuid
);


--
-- TOC entry 223 (class 1259 OID 17749)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    email character varying NOT NULL,
    password character varying NOT NULL,
    full_name character varying NOT NULL,
    role public.users_role_enum DEFAULT 'ADMIN'::public.users_role_enum NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


--
-- TOC entry 5110 (class 0 OID 17687)
-- Dependencies: 220
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.articles (id, created_at, updated_at, deleted_at, title, slug, summary, content, status, published_at, thumbnail_id, author_id) VALUES ('f1e69d73-cb41-4931-82d0-4f5299b8b485', '2026-06-24 14:47:40.16722', '2026-07-13 09:41:53.608868', NULL, '🩸 MỖI GIỌT MÁU CHO ĐI – MỘT CUỘC ĐỜI Ở LẠI ❤️', 'moi-giot-mau-cho-di-mot-cuoc-doi-o-lai', 'Hãy cùng HURC lan tỏa yêu thương bằng hành động hiến máu cứu người.', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Hãy&nbsp;cùng&nbsp;HURC&nbsp;lan&nbsp;tỏa&nbsp;yêu&nbsp;thương&nbsp;bằng&nbsp;hành&nbsp;động&nbsp;hiến&nbsp;máu&nbsp;cứu&nbsp;người.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">📅&nbsp;Thời&nbsp;gian:&nbsp;07h00&nbsp;–&nbsp;11h00,&nbsp;ngày&nbsp;10/6/2026</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">📍&nbsp;Địa&nbsp;điểm:&nbsp;Ga&nbsp;Metro&nbsp;Bến&nbsp;Thành&nbsp;(Tuyến&nbsp;Metro&nbsp;số&nbsp;1)</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">📋&nbsp;</span><a href="https://docs.google.com/forms/d/e/1FAIpQLSe_hkW4uNDYv2Al9LKYpkRHapJ8Yfl4OC0AbAS8gVfCJxsULQ/viewform?usp=dialog" rel="noopener noreferrer" target="_blank" style="background-color: rgb(255, 255, 255); color: inherit;">Đăng&nbsp;ký&nbsp;ngay</a></p><p></p><p><img src="http://localhost:3000/uploads/image-1783910496622-425692067.jpg"></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Cùng&nbsp;chung&nbsp;tay&nbsp;sẻ&nbsp;chia&nbsp;vì&nbsp;sức&nbsp;khỏe&nbsp;cộng&nbsp;đồng&nbsp;và&nbsp;trao&nbsp;thêm&nbsp;cơ&nbsp;hội&nbsp;sống&nbsp;cho&nbsp;những&nbsp;bệnh&nbsp;nhân&nbsp;đang&nbsp;cần&nbsp;máu!</span></p>', 'PUBLISHED', '2026-06-24 14:47:00', '1ddeb0f7-21c6-4b11-ab6a-5b5ca77b013f', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.articles (id, created_at, updated_at, deleted_at, title, slug, summary, content, status, published_at, thumbnail_id, author_id) VALUES ('6ed83849-8b48-457f-bb4b-9ec85593fa99', '2026-06-24 14:46:00.403785', '2026-07-13 09:49:53.572125', NULL, 'Từ những ký ức thời chiến đến thông điệp hòa bình trên tuyến Metro số 1', 'tu-nhung-ky-uc-thoi-chien-den-thong-diep-hoa-binh-tren-tuyen-metro-so-1', 'Từ ngày 30/5 đến ngày 5/6/2026, Công ty TNHH MTV Đường sắt đô thị số 1 TP.HCM (HURC) phối hợp cùng Bảo tàng Chứng tích Chiến tranh tổ chức triển lãm chuyên đề “Trẻ em thời chiến” tại ga Nhà hát Thành phố thuộc tuyến Metro số 1 (Bến Thành – Suối Tiên).', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Từ&nbsp;ngày&nbsp;30/5&nbsp;đến&nbsp;ngày&nbsp;5/6/2026,&nbsp;Công&nbsp;ty&nbsp;TNHH&nbsp;MTV&nbsp;Đường&nbsp;sắt&nbsp;đô&nbsp;thị&nbsp;số&nbsp;1&nbsp;TP.HCM&nbsp;(HURC)&nbsp;phối&nbsp;hợp&nbsp;cùng&nbsp;Bảo&nbsp;tàng&nbsp;Chứng&nbsp;tích&nbsp;Chiến&nbsp;tranh&nbsp;tổ&nbsp;chức&nbsp;triển&nbsp;lãm&nbsp;chuyên&nbsp;đề&nbsp;“Trẻ&nbsp;em&nbsp;thời&nbsp;chiến”&nbsp;tại&nbsp;ga&nbsp;Nhà&nbsp;hát&nbsp;Thành&nbsp;phố&nbsp;thuộc&nbsp;tuyến&nbsp;Metro&nbsp;số&nbsp;1&nbsp;(Bến&nbsp;Thành&nbsp;–&nbsp;Suối&nbsp;Tiên).</span></p><p><img src="http://localhost:3000/uploads/image-1783910318177-897219571.jpg"></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Thông&nbsp;qua&nbsp;các&nbsp;hình&nbsp;ảnh,&nbsp;tư&nbsp;liệu&nbsp;và&nbsp;câu&nbsp;chuyện&nbsp;chân&nbsp;thực,&nbsp;triển&nbsp;lãm&nbsp;tái&nbsp;hiện&nbsp;cuộc&nbsp;sống&nbsp;của&nbsp;trẻ&nbsp;em&nbsp;Việt&nbsp;Nam&nbsp;trong&nbsp;những&nbsp;năm&nbsp;tháng&nbsp;chiến&nbsp;tranh.&nbsp;Những&nbsp;ký&nbsp;ức&nbsp;về&nbsp;mất&nbsp;mát,&nbsp;khó&nbsp;khăn&nbsp;nhưng&nbsp;cũng&nbsp;đầy&nbsp;nghị&nbsp;lực&nbsp;và&nbsp;khát&nbsp;vọng&nbsp;hòa&nbsp;bình&nbsp;được&nbsp;giới&nbsp;thiệu&nbsp;đến&nbsp;hành&nbsp;khách,&nbsp;giúp&nbsp;công&nbsp;chúng&nbsp;có&nbsp;thêm&nbsp;góc&nbsp;nhìn&nbsp;sâu&nbsp;sắc&nbsp;về&nbsp;một&nbsp;giai&nbsp;đoạn&nbsp;lịch&nbsp;sử&nbsp;của&nbsp;dân&nbsp;tộc.</span></p><p><img src="http://localhost:3000/uploads/image-1783910980655-347312400.jpg"></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Không&nbsp;chỉ&nbsp;là&nbsp;hoạt&nbsp;động&nbsp;trưng&nbsp;bày,&nbsp;triển&nbsp;lãm&nbsp;còn&nbsp;mang&nbsp;ý&nbsp;nghĩa&nbsp;giáo&nbsp;dục&nbsp;truyền&nbsp;thống,&nbsp;góp&nbsp;phần&nbsp;lan&nbsp;tỏa&nbsp;tinh&nbsp;thần&nbsp;yêu&nbsp;nước,&nbsp;lòng&nbsp;biết&nbsp;ơn&nbsp;và&nbsp;nâng&nbsp;cao&nbsp;nhận&nbsp;thức&nbsp;của&nbsp;thế&nbsp;hệ&nbsp;trẻ&nbsp;về&nbsp;giá&nbsp;trị&nbsp;của&nbsp;hòa&nbsp;bình&nbsp;hôm&nbsp;nay.&nbsp;Nhằm&nbsp;hỗ&nbsp;trợ&nbsp;khách&nbsp;tham&nbsp;quan&nbsp;tìm&nbsp;hiểu&nbsp;sâu&nbsp;hơn&nbsp;về&nbsp;nội&nbsp;dung&nbsp;triển&nbsp;lãm,&nbsp;Ban&nbsp;Tổ&nbsp;chức&nbsp;bố&nbsp;trí&nbsp;các&nbsp;buổi&nbsp;thuyết&nbsp;minh&nbsp;miễn&nbsp;phí&nbsp;vào&nbsp;ngày&nbsp;31/5&nbsp;(từ&nbsp;13&nbsp;giờ&nbsp;đến&nbsp;16&nbsp;giờ&nbsp;30)&nbsp;và&nbsp;ngày&nbsp;1/6&nbsp;(từ&nbsp;7&nbsp;giờ&nbsp;30&nbsp;đến&nbsp;11&nbsp;giờ&nbsp;30,&nbsp;từ&nbsp;13&nbsp;giờ&nbsp;đến&nbsp;16&nbsp;giờ&nbsp;30).</span></p><p><img src="http://localhost:3000/uploads/image-1783909694954-811879729.jpg"></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Với&nbsp;việc&nbsp;đưa&nbsp;triển&nbsp;lãm&nbsp;lịch&nbsp;sử&nbsp;vào&nbsp;không&nbsp;gian&nbsp;nhà&nbsp;ga,&nbsp;Metro&nbsp;số&nbsp;1&nbsp;không&nbsp;chỉ&nbsp;là&nbsp;phương&nbsp;tiện&nbsp;giao&nbsp;thông&nbsp;công&nbsp;cộng&nbsp;mà&nbsp;còn&nbsp;trở&nbsp;thành&nbsp;điểm&nbsp;kết&nbsp;nối&nbsp;văn&nbsp;hóa,&nbsp;giáo&nbsp;dục&nbsp;và&nbsp;cộng&nbsp;đồng,&nbsp;mang&nbsp;đến&nbsp;những&nbsp;trải&nbsp;nghiệm&nbsp;ý&nbsp;nghĩa&nbsp;cho&nbsp;hành&nbsp;khách&nbsp;trong&nbsp;mỗi&nbsp;hành&nbsp;trình.</span></p><p><img src="http://localhost:3000/uploads/image-1783910303571-411928481.jpg"></p>', 'PUBLISHED', '2026-06-24 14:46:00', 'abd342bc-78ce-4b5f-acfb-578fb0b42c58', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.articles (id, created_at, updated_at, deleted_at, title, slug, summary, content, status, published_at, thumbnail_id, author_id) VALUES ('6eed569e-4f11-4769-89fe-c06ef91f7d15', '2026-06-24 14:40:08.827061', '2026-07-10 16:26:48.012144', NULL, 'BÁO CÁO TÀI CHÍNH NĂM 2025', 'bao-cao-tai-chinh-nam-2025', 'Báo cáo tài chính năm 2025', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Công&nbsp;ty&nbsp;TNHH&nbsp;MTV&nbsp;Đường&nbsp;sắt&nbsp;Đô&nbsp;thị&nbsp;số&nbsp;1&nbsp;xin&nbsp;trân&nbsp;trọng&nbsp;công&nbsp;bố:</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Báo&nbsp;cáo&nbsp;tài&nbsp;chính&nbsp;năm&nbsp;2025.&nbsp;Xem&nbsp;chi&nbsp;tiết&nbsp;tại&nbsp;</span><a href="https://drive.google.com/file/d/1db4q2vdejSd-33V6p68MF8PBuYZqbQD0/view?usp=sharing" rel="noopener noreferrer" target="_blank" style="background-color: rgb(255, 255, 255); color: inherit;">đây</a></p>', 'PUBLISHED', '2026-06-24 14:40:00', '2bc6e712-4b56-49cd-abe5-d9c8125660b1', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.articles (id, created_at, updated_at, deleted_at, title, slug, summary, content, status, published_at, thumbnail_id, author_id) VALUES ('fca6f590-4437-4098-9689-20acbb1a9385', '2026-06-24 14:06:08.642957', '2026-07-13 09:09:59.53452', NULL, '✨ Thêm ưu đãi cho hành trình Metro mỗi ngày', 'them-uu-dai-cho-hanh-trinh-metro-moi-ngay', 'HCMC Metro đồng hành cùng Techcombank mang đến thêm ưu đãi thanh toán cho hành khách khi di chuyển trên tuyến Metro số 1 (Bến Thành – Suối Tiên).', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">HCMC&nbsp;Metro&nbsp;đồng&nbsp;hành&nbsp;cùng&nbsp;Techcombank&nbsp;mang&nbsp;đến&nbsp;thêm&nbsp;ưu&nbsp;đãi&nbsp;thanh&nbsp;toán&nbsp;cho&nbsp;hành&nbsp;khách&nbsp;khi&nbsp;di&nbsp;chuyển&nbsp;trên&nbsp;tuyến&nbsp;Metro&nbsp;số&nbsp;1&nbsp;(Bến&nbsp;Thành&nbsp;–&nbsp;Suối&nbsp;Tiên).</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Khách&nbsp;hàng&nbsp;mở&nbsp;mới&nbsp;tài&nbsp;khoản&nbsp;Techcombank&nbsp;và&nbsp;sử&nbsp;dụng&nbsp;thẻ&nbsp;thanh&nbsp;toán&nbsp;Techcombank&nbsp;Visa&nbsp;Eco&nbsp;có&nbsp;thể:</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">✨&nbsp;Hoàn&nbsp;tiền&nbsp;đến&nbsp;300.000&nbsp;U-point/tháng&nbsp;khi&nbsp;thanh&nbsp;toán&nbsp;vé&nbsp;Metro&nbsp;TP.HCM</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">✨&nbsp;Chạm&nbsp;thẻ&nbsp;nhanh&nbsp;tại&nbsp;cổng/quầy&nbsp;vé&nbsp;hoặc&nbsp;liên&nbsp;kết&nbsp;trên&nbsp;ứng&nbsp;dụng&nbsp;HCMC&nbsp;Metro&nbsp;HURC</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">✨&nbsp;Thanh&nbsp;toán&nbsp;vé&nbsp;tháng&nbsp;thuận&nbsp;tiện,&nbsp;di&nbsp;chuyển&nbsp;không&nbsp;giới&nbsp;hạn</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Lựa&nbsp;chọn&nbsp;Metro&nbsp;không&nbsp;chỉ&nbsp;giúp&nbsp;việc&nbsp;đi&nbsp;lại&nbsp;thuận&nbsp;tiện&nbsp;hơn&nbsp;mà&nbsp;còn&nbsp;góp&nbsp;phần&nbsp;xây&nbsp;dựng&nbsp;thói&nbsp;quen&nbsp;giao&nbsp;thông&nbsp;xanh,&nbsp;văn&nbsp;minh&nbsp;và&nbsp;bền&nbsp;vững&nbsp;🌱&nbsp;📅&nbsp;Chương&nbsp;trình&nbsp;áp&nbsp;dụng&nbsp;đến&nbsp;hết&nbsp;ngày&nbsp;30/06/2026&nbsp;dành&nbsp;cho&nbsp;khách&nbsp;hàng&nbsp;sử&nbsp;dụng&nbsp;tài&nbsp;khoản&nbsp;Techcombank&nbsp;Visa&nbsp;Eco.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">👉&nbsp;Thông&nbsp;tin&nbsp;đăng&nbsp;ký&nbsp;tài&nbsp;khoản&nbsp;và&nbsp;thẻ&nbsp;Visa&nbsp;Eco:&nbsp;https://tcbmobile.onelink.me/TBS9/tfl1o1fs</span></p><p><img src="http://localhost:3000/uploads/image-1783908588105-602244996.png"></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">*Áp&nbsp;dụng&nbsp;theo&nbsp;điều&nbsp;kiện&nbsp;và&nbsp;điều&nbsp;khoản&nbsp;chương&nbsp;trình.</span></p>', 'PUBLISHED', '2026-06-24 14:06:00', 'c8dedbb6-65e2-407a-976e-f8b676053a94', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.articles (id, created_at, updated_at, deleted_at, title, slug, summary, content, status, published_at, thumbnail_id, author_id) VALUES ('66a0896b-68fd-4132-b838-58835f69ef2d', '2026-06-24 14:12:28.385905', '2026-07-13 09:37:04.597189', NULL, 'ATM VÉ NGHĨA TÌNH - ĐỒNG HÀNH CÙNG HÀNH KHÁCH CÓ HOÀN CẢNH KHÓ KHĂN', 'atm-ve-nghia-tinh-dong-hanh-cung-hanh-khach-co-hoan-canh-kho-khan', 'Đài Phát thanh và Truyền hình TP.HCM (HTV) phối hợp cùng Công ty TNHH MTV Đường sắt đô thị số 1 TP.HCM (HURC) chính thức công bố triển khai chương trình “ATM Vé Nghĩa Tình"', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Ngày&nbsp;19/5/2026,&nbsp;Đài&nbsp;Phát&nbsp;thanh&nbsp;và&nbsp;Truyền&nbsp;hình&nbsp;TP.HCM&nbsp;(HTV)&nbsp;phối&nbsp;hợp&nbsp;cùng&nbsp;Công&nbsp;ty&nbsp;TNHH&nbsp;MTV&nbsp;Đường&nbsp;sắt&nbsp;đô&nbsp;thị&nbsp;số&nbsp;1&nbsp;TP.HCM&nbsp;(HURC)&nbsp;chính&nbsp;thức&nbsp;công&nbsp;bố&nbsp;triển&nbsp;khai&nbsp;chương&nbsp;trình&nbsp;“ATM&nbsp;Vé&nbsp;Nghĩa&nbsp;Tình&nbsp;-&nbsp;Đồng&nbsp;hành&nbsp;cùng&nbsp;hành&nbsp;khách&nbsp;có&nbsp;hoàn&nbsp;cảnh&nbsp;khó&nbsp;khăn”&nbsp;tại&nbsp;tuyến&nbsp;Metro&nbsp;số&nbsp;1&nbsp;(Bến&nbsp;Thành&nbsp;–&nbsp;Suối&nbsp;Tiên).</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Đây&nbsp;là&nbsp;mô&nbsp;hình&nbsp;ý&nbsp;nghĩa&nbsp;nhằm&nbsp;hỗ&nbsp;trợ&nbsp;các&nbsp;hành&nbsp;khách&nbsp;có&nbsp;hoàn&nbsp;cảnh&nbsp;khó&nbsp;khăn&nbsp;tiếp&nbsp;cận&nbsp;phương&nbsp;tiện&nbsp;giao&nbsp;thông&nbsp;công&nbsp;cộng&nbsp;văn&nbsp;minh,&nbsp;hiện&nbsp;đại&nbsp;và&nbsp;thân&nbsp;thiện&nbsp;với&nbsp;môi&nbsp;trường&nbsp;thông&nbsp;qua&nbsp;những&nbsp;chuyến&nbsp;Metro&nbsp;miễn&nbsp;phí.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Từ&nbsp;ngày&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">05/6/2026</strong><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">,&nbsp;Kiosk&nbsp;“ATM&nbsp;Vé&nbsp;Nghĩa&nbsp;Tình”&nbsp;sẽ&nbsp;được&nbsp;đưa&nbsp;vào&nbsp;hoạt&nbsp;động&nbsp;thí&nbsp;điểm&nbsp;tại&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">ga&nbsp;Bến&nbsp;Thành&nbsp;và&nbsp;ga&nbsp;Bến&nbsp;xe&nbsp;Suối&nbsp;Tiên</strong><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">🎫&nbsp;Hành&nbsp;khách&nbsp;có&nbsp;thể&nbsp;nhận&nbsp;vé&nbsp;nghĩa&nbsp;tình&nbsp;tại&nbsp;kiosk&nbsp;“ATM&nbsp;Vé&nbsp;Nghĩa&nbsp;Tình”&nbsp;bằng&nbsp;cách:</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">1️⃣&nbsp;Lựa&nbsp;chọn&nbsp;lộ&nbsp;trình&nbsp;di&nbsp;chuyển</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">2️⃣&nbsp;Quét&nbsp;mã&nbsp;QR&nbsp;trên&nbsp;Căn&nbsp;Cước&nbsp;hoặc&nbsp;tại&nbsp;ứng&nbsp;dụng&nbsp;VNeID</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">3️⃣&nbsp;Nhận&nbsp;phiếu&nbsp;đi&nbsp;tàu&nbsp;miễn&nbsp;phí&nbsp;tại&nbsp;ga</span></p><p><img src="http://localhost:3000/uploads/image-1783910211155-791613882.png"></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Chương&nbsp;trình&nbsp;dự&nbsp;kiến&nbsp;sẽ&nbsp;phát&nbsp;hành&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">từ&nbsp;500&nbsp;–&nbsp;1000&nbsp;vé&nbsp;Metro&nbsp;miễn&nbsp;phí&nbsp;mỗi&nbsp;ngày</strong><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">,&nbsp;với&nbsp;sự&nbsp;đồng&nbsp;hành&nbsp;của&nbsp;các&nbsp;tổ&nbsp;chức,&nbsp;doanh&nbsp;nghiệp&nbsp;và&nbsp;các&nbsp;nhà&nbsp;hảo&nbsp;tâm.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">“ATM&nbsp;Vé&nbsp;Nghĩa&nbsp;Tình”&nbsp;không&nbsp;chỉ&nbsp;góp&nbsp;phần&nbsp;lan&nbsp;tỏa&nbsp;tinh&nbsp;thần&nbsp;sẻ&nbsp;chia,&nbsp;nghĩa&nbsp;tình&nbsp;của&nbsp;Thành&nbsp;phố&nbsp;Hồ&nbsp;Chí&nbsp;Minh&nbsp;mà&nbsp;còn&nbsp;khuyến&nbsp;khích&nbsp;người&nbsp;dân&nbsp;sử&nbsp;dụng&nbsp;giao&nbsp;thông&nbsp;công&nbsp;cộng&nbsp;xanh,&nbsp;hiện&nbsp;đại&nbsp;và&nbsp;bền&nbsp;vững.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">💙&nbsp;Trao&nbsp;yêu&nbsp;thương&nbsp;qua&nbsp;từng&nbsp;chuyến&nbsp;Metro&nbsp;💙</span></p>', 'PUBLISHED', '2026-06-24 14:12:00', '2950d114-c3bf-40b2-805b-9e8789f5a3cf', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.articles (id, created_at, updated_at, deleted_at, title, slug, summary, content, status, published_at, thumbnail_id, author_id) VALUES ('6605e0ff-4401-4220-904a-f0eac55ce560', '2026-06-20 16:16:01.183519', '2026-07-13 08:55:39.83314', NULL, '💙🇻🇳 MỪNG NGÀY THỐNG NHẤT – ĐI METRO THẬT CHẤT 🚆', 'mung-ngay-thong-nhat-di-metro-that-chat', 'Nhân dịp Đại lễ 30/4 – 1/5, HURC mang đến minigame siêu hấp dẫn dành cho tất cả hành khách yêu thích Metro số 1 💙', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Nhân&nbsp;dịp&nbsp;Đại&nbsp;lễ&nbsp;30/4&nbsp;–&nbsp;1/5,&nbsp;HURC&nbsp;mang&nbsp;đến&nbsp;minigame&nbsp;siêu&nbsp;hấp&nbsp;dẫn&nbsp;dành&nbsp;cho&nbsp;tất&nbsp;cả&nbsp;hành&nbsp;khách&nbsp;yêu&nbsp;thích&nbsp;Metro&nbsp;số&nbsp;1&nbsp;💙</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">📌&nbsp;CÁCH&nbsp;THAM&nbsp;GIA&nbsp;CỰC&nbsp;ĐƠN&nbsp;GIẢN:</span></p><p><a href="https://www.facebook.com/share/v/18WnY8Xc3i/" rel="noopener noreferrer" target="_blank" style="background-color: rgb(255, 255, 255); color: inherit;">THAM&nbsp;GIA&nbsp;TẠI&nbsp;ĐÂY</a></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">1️⃣&nbsp;Thích&nbsp;và&nbsp;Theo&nbsp;dõi&nbsp;Fanpage&nbsp;Công&nbsp;ty&nbsp;TNHH&nbsp;MTV&nbsp;Đường&nbsp;sắt&nbsp;đô&nbsp;thị&nbsp;số&nbsp;1&nbsp;(HURC1);</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">2️⃣&nbsp;Thích&nbsp;–&nbsp;Bình&nbsp;luận&nbsp;–&nbsp;Chia&nbsp;sẻ&nbsp;bài&nbsp;viết&nbsp;minigame&nbsp;ở&nbsp;chế&nbsp;độ&nbsp;công&nbsp;khai;</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">3️⃣&nbsp;Bình&nbsp;luận&nbsp;gồm:</span></p><ul><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Điều&nbsp;bạn&nbsp;thích&nbsp;nhất&nbsp;khi&nbsp;sử&nbsp;dụng&nbsp;Metro&nbsp;số&nbsp;1;</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Kèm&nbsp;ảnh&nbsp;trải&nbsp;nghiệm&nbsp;hoặc&nbsp;văn&nbsp;hóa&nbsp;đi&nbsp;Metro;</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tag&nbsp;ít&nbsp;nhất&nbsp;01&nbsp;người&nbsp;bạn&nbsp;mời&nbsp;cùng&nbsp;tham&nbsp;gia&nbsp;minigame;</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Hashtag:&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">#Mungngaythongnhat&nbsp;#Dimetrothatchat&nbsp;#HURC&nbsp;#HCMCMETRO</strong><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">;</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Để&nbsp;lại&nbsp;4&nbsp;số&nbsp;cuối&nbsp;số&nbsp;điện&nbsp;thoại&nbsp;(để&nbsp;xác&nbsp;minh&nbsp;nhận&nbsp;thưởng).</span></li></ul><p><img src="http://localhost:3000/uploads/image-1783907700115-10695142.jpg"></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">🎁&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">55&nbsp;PHẦN&nbsp;QUÀ</strong><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">&nbsp;ĐANG&nbsp;CHỜ&nbsp;BẠN:</span></p><ul><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Thẻ&nbsp;trả&nbsp;trước&nbsp;Vikki&nbsp;Mastercard&nbsp;Pro&nbsp;(mệnh&nbsp;giá&nbsp;50.000đ)&nbsp;–&nbsp;15&nbsp;giải&nbsp;💳</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Túi&nbsp;Tote&nbsp;Metro&nbsp;–&nbsp;10&nbsp;giải&nbsp;👜</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Ly&nbsp;sứ&nbsp;Metro&nbsp;–&nbsp;10&nbsp;giải&nbsp;☕</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Thẻ&nbsp;hành&nbsp;lý&nbsp;Metro&nbsp;–&nbsp;20&nbsp;giải&nbsp;🏷️</span></li></ul><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">⏰&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Thời&nbsp;gian&nbsp;tham&nbsp;gia:&nbsp;18/04&nbsp;–&nbsp;01/05/2026</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">📢&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Công&nbsp;bố&nbsp;kết&nbsp;quả&nbsp;và&nbsp;trao&nbsp;giải:&nbsp;04/05/2026</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">⚠️&nbsp;Lưu&nbsp;ý:</span></p><ul><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Ảnh&nbsp;dự&nbsp;thi&nbsp;phải&nbsp;chính&nbsp;chủ&nbsp;hoặc&nbsp;sử&nbsp;dụng&nbsp;trí&nbsp;tuệ&nbsp;nhân&nbsp;tạo&nbsp;(AI),&nbsp;hình&nbsp;ảnh&nbsp;phải&nbsp;thể&nbsp;hiện&nbsp;được&nbsp;hình&nbsp;ảnh&nbsp;của&nbsp;tuyến&nbsp;metro&nbsp;số&nbsp;1;</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Người&nbsp;dùng&nbsp;có&nbsp;thể&nbsp;tham&nbsp;gia&nbsp;nhiều&nbsp;lần&nbsp;để&nbsp;tăng&nbsp;cơ&nbsp;hội&nbsp;trúng&nbsp;thưởng;</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">HURC&nbsp;được&nbsp;quyền&nbsp;sử&nbsp;dụng&nbsp;hình&nbsp;ảnh&nbsp;người&nbsp;dùng&nbsp;tham&nbsp;gia&nbsp;chương&nbsp;trình&nbsp;cho&nbsp;mục&nbsp;đích&nbsp;truyền&nbsp;thông.</span></li></ul><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">💙&nbsp;Cùng&nbsp;chia&nbsp;sẻ&nbsp;khoảnh&nbsp;khắc&nbsp;Metro&nbsp;văn&nbsp;minh,&nbsp;hiện&nbsp;đại&nbsp;và&nbsp;lan&nbsp;tỏa&nbsp;văn&nbsp;hóa&nbsp;giao&nbsp;thông&nbsp;công&nbsp;cộng&nbsp;nhé!&nbsp;#Mungngaythongnhat&nbsp;#Dimetrothatchat&nbsp;#HURC&nbsp;#HCMCMETRO&nbsp;#Vikki&nbsp;#Mastercard</span></p>', 'PUBLISHED', '2026-06-20 16:16:00', '2863f7fa-8112-45b0-be79-61e3313fa58a', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.articles (id, created_at, updated_at, deleted_at, title, slug, summary, content, status, published_at, thumbnail_id, author_id) VALUES ('9caf9609-ed3e-44d8-91fd-af1033039eed', '2026-06-24 14:50:04.127943', '2026-07-13 09:45:07.953926', NULL, '🎼 METRO SONATA – HÒA NHẠC TRONG LÒNG METRO 🎶', 'metro-sonata-hoa-nhac-trong-long-metro', 'HURC phối hợp cùng các đơn vị đồng hành tổ chức chương trình "METRO Sonata – Hòa nhạc trong lòng Metro”.', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Hưởng&nbsp;ứng&nbsp;Tháng&nbsp;hành&nbsp;động&nbsp;vì&nbsp;trẻ&nbsp;em&nbsp;năm&nbsp;2026&nbsp;với&nbsp;chủ&nbsp;đề&nbsp;&quot;Trẻ&nbsp;em&nbsp;hạnh&nbsp;phúc,&nbsp;an&nbsp;toàn,&nbsp;vững&nbsp;bước&nbsp;trong&nbsp;kỷ&nbsp;nguyên&nbsp;số”,&nbsp;HURC&nbsp;phối&nbsp;hợp&nbsp;cùng&nbsp;các&nbsp;đơn&nbsp;vị&nbsp;đồng&nbsp;hành&nbsp;tổ&nbsp;chức&nbsp;chương&nbsp;trình&nbsp;&quot;METRO&nbsp;Sonata&nbsp;–&nbsp;Hòa&nbsp;nhạc&nbsp;trong&nbsp;lòng&nbsp;Metro”.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Các&nbsp;tiết&nbsp;mục&nbsp;sẽ&nbsp;được&nbsp;trình&nbsp;diễn&nbsp;bởi&nbsp;học&nbsp;viên,&nbsp;nhóm&nbsp;nhạc&nbsp;trẻ&nbsp;và&nbsp;nghệ&nbsp;sĩ&nbsp;khách&nbsp;mời&nbsp;thuộc&nbsp;Học&nbsp;viện&nbsp;Nghệ&nbsp;thuật&nbsp;Đa&nbsp;lĩnh&nbsp;vực&nbsp;Soul&nbsp;(SIA),&nbsp;góp&nbsp;phần&nbsp;tạo&nbsp;điều&nbsp;kiện&nbsp;để&nbsp;trẻ&nbsp;em&nbsp;được&nbsp;tiếp&nbsp;cận&nbsp;với&nbsp;nghệ&nbsp;thuật,&nbsp;nuôi&nbsp;dưỡng&nbsp;niềm&nbsp;đam&nbsp;mê&nbsp;âm&nbsp;nhạc&nbsp;và&nbsp;phát&nbsp;triển&nbsp;khả&nbsp;năng&nbsp;sáng&nbsp;tạo.</span></p><p><img src="http://localhost:3000/uploads/image-1783910699454-905993513.jpg"></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Một&nbsp;không&nbsp;gian&nbsp;nghệ&nbsp;thuật&nbsp;đặc&nbsp;biệt&nbsp;sẽ&nbsp;được&nbsp;mang&nbsp;đến&nbsp;ngay&nbsp;tại&nbsp;Ga&nbsp;Bến&nbsp;Thành,&nbsp;hứa&nbsp;hẹn&nbsp;mang&nbsp;đến&nbsp;những&nbsp;trải&nbsp;nghiệm&nbsp;đáng&nbsp;nhớ&nbsp;cho&nbsp;hành&nbsp;khách&nbsp;Metro&nbsp;và&nbsp;cộng&nbsp;đồng&nbsp;thông&nbsp;qua&nbsp;những&nbsp;giai&nbsp;điệu&nbsp;giàu&nbsp;cảm&nbsp;xúc&nbsp;giữa&nbsp;lòng&nbsp;thành&nbsp;phố.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">📅&nbsp;Thứ&nbsp;Sáu,&nbsp;19/6/2026&nbsp;⏰&nbsp;18g00&nbsp;–&nbsp;20g00&nbsp;📍Ga&nbsp;Bến&nbsp;Thành&nbsp;–&nbsp;Tuyến&nbsp;Metro&nbsp;số&nbsp;1</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">🎻&nbsp;Kính&nbsp;mời&nbsp;Quý&nbsp;hành&nbsp;khách,&nbsp;người&nbsp;dân&nbsp;Thành&nbsp;phố&nbsp;và&nbsp;các&nbsp;em&nbsp;nhỏ&nbsp;đến&nbsp;tham&nbsp;dự&nbsp;và&nbsp;thưởng&nbsp;thức&nbsp;miễn&nbsp;phí&nbsp;chương&nbsp;trình&nbsp;&quot;METRO&nbsp;Sonata&nbsp;–&nbsp;Hòa&nbsp;nhạc&nbsp;trong&nbsp;lòng&nbsp;Metro”.</span></p>', 'PUBLISHED', '2026-06-24 14:50:00', '0ff468be-2042-47b1-828c-ffb4bf7f5bff', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.articles (id, created_at, updated_at, deleted_at, title, slug, summary, content, status, published_at, thumbnail_id, author_id) VALUES ('bbf615b7-ff40-40d1-8b66-cf9ead0e4606', '2026-06-20 16:15:39.237129', '2026-07-13 09:35:44.969782', NULL, 'KẾ HOẠCH CHẠY TÀU DỊP LỄ GIỖ TỔ HÙNG VƯƠNG, KỈ NIỆM 51 NĂM NGÀY GIẢI PHÓNG MIỀN NAM 30/4 VÀ QUỐC TẾ LAO ĐỘNG 01/5 NĂM 2026', 'ke-hoach-chay-tau-dip-le-gio-to-hung-vuong-ki-niem-51-nam-ngay-giai-phong-mien-nam-304-va-quoc-te-lao-dong-015-nam-2026', 'Kỷ niệm 51 năm ngày Giải phóng miền Nam - Thống nhất đất nước (30/4/1975 - 30/4/2026) và Quốc tế Lao động (01/5), tuyến Metro số 1 (Bến Thành – Suối Tiên) tăng cường tần suất chạy tàu và sẵn sàng vận hành tối đa công suất để phục vụ Quý hành khách trong suốt kỳ nghỉ Lễ.', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Nhằm&nbsp;mang&nbsp;đến&nbsp;trải&nbsp;nghiệm&nbsp;di&nbsp;chuyển&nbsp;thuận&nbsp;tiện,&nbsp;hiện&nbsp;đại&nbsp;và&nbsp;an&nbsp;toàn&nbsp;cho&nbsp;người&nbsp;dân&nbsp;Thành&nbsp;phố&nbsp;và&nbsp;du&nbsp;khách&nbsp;trong&nbsp;dịp&nbsp;Lễ&nbsp;Giỗ&nbsp;Tổ&nbsp;Hùng&nbsp;Vương,&nbsp;Kỷ&nbsp;niệm&nbsp;51&nbsp;năm&nbsp;ngày&nbsp;Giải&nbsp;phóng&nbsp;miền&nbsp;Nam&nbsp;-&nbsp;Thống&nbsp;nhất&nbsp;đất&nbsp;nước&nbsp;(30/4/1975&nbsp;-&nbsp;30/4/2026)&nbsp;và&nbsp;Quốc&nbsp;tế&nbsp;Lao&nbsp;động&nbsp;(01/5),&nbsp;tuyến&nbsp;Metro&nbsp;số&nbsp;1&nbsp;(Bến&nbsp;Thành&nbsp;–&nbsp;Suối&nbsp;Tiên)&nbsp;tăng&nbsp;cường&nbsp;tần&nbsp;suất&nbsp;chạy&nbsp;tàu&nbsp;và&nbsp;sẵn&nbsp;sàng&nbsp;vận&nbsp;hành&nbsp;tối&nbsp;đa&nbsp;công&nbsp;suất&nbsp;để&nbsp;phục&nbsp;vụ&nbsp;Quý&nbsp;hành&nbsp;khách&nbsp;trong&nbsp;suốt&nbsp;kỳ&nbsp;nghỉ&nbsp;Lễ.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">HURC&nbsp;khuyến&nbsp;nghị&nbsp;Quý&nbsp;hành&nbsp;khách&nbsp;chủ&nbsp;động&nbsp;theo&nbsp;dõi&nbsp;lịch&nbsp;chạy&nbsp;tàu,&nbsp;tuân&nbsp;thủ&nbsp;hướng&nbsp;dẫn&nbsp;của&nbsp;nhân&nbsp;viên&nbsp;nhà&nbsp;ga,&nbsp;giữ&nbsp;gìn&nbsp;vệ&nbsp;sinh&nbsp;chung,&nbsp;bảo&nbsp;quản&nbsp;tư&nbsp;trang&nbsp;cá&nbsp;nhân&nbsp;và&nbsp;đảm&nbsp;bảo&nbsp;an&nbsp;toàn&nbsp;khi&nbsp;di&nbsp;chuyển&nbsp;trong&nbsp;khung&nbsp;giờ&nbsp;cao&nbsp;điểm.</span></p><p><img src="http://localhost:3000/uploads/image-1783910142312-181077110.jpg"></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Đừng&nbsp;quên&nbsp;lưu&nbsp;lại&nbsp;lịch&nbsp;chạy&nbsp;tàu&nbsp;chi&nbsp;tiết&nbsp;trong&nbsp;hình&nbsp;dưới&nbsp;đây&nbsp;để&nbsp;sắp&nbsp;xếp&nbsp;lộ&nbsp;trình&nbsp;phù&nbsp;hợp&nbsp;bạn&nbsp;nhé!</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Mỗi&nbsp;chuyến&nbsp;đi&nbsp;là&nbsp;một&nbsp;trải&nbsp;nghiệm,&nbsp;mỗi&nbsp;hành&nbsp;trình&nbsp;là&nbsp;một&nbsp;niềm&nbsp;vui&nbsp;-&nbsp;Hãy&nbsp;để&nbsp;Metro&nbsp;số&nbsp;1&nbsp;cùng&nbsp;bạn&nbsp;viết&nbsp;tiếp&nbsp;những&nbsp;câu&nbsp;chuyện&nbsp;hạnh&nbsp;phúc&nbsp;trên&nbsp;mọi&nbsp;cung&nbsp;đường.&nbsp;HURC&nbsp;xin&nbsp;kính&nbsp;chúc&nbsp;Quý&nbsp;hành&nbsp;khách&nbsp;có&nbsp;một&nbsp;kỳ&nbsp;nghỉ&nbsp;Lễ&nbsp;an&nbsp;toàn&nbsp;và&nbsp;trọn&nbsp;vẹn&nbsp;niềm&nbsp;vui.</span></p><p><a href="https://drive.google.com/drive/folders/1Zvx7Qe3WhlRHI9S3cQi_b-Xu_Vdw132H" rel="noopener noreferrer" target="_blank" style="background-color: rgb(255, 255, 255); color: inherit;">LỊCH&nbsp;CHẠY&nbsp;TÀU</a></p>', 'PUBLISHED', '2026-06-24 14:01:00', '0cba1cb7-e0fa-4c0e-b65e-8a4ac6da45d9', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.articles (id, created_at, updated_at, deleted_at, title, slug, summary, content, status, published_at, thumbnail_id, author_id) VALUES ('a8eb3981-927f-45c7-8c33-8e92798054cb', '2026-07-08 10:55:02.699168', '2026-07-13 09:46:42.978291', NULL, '🎉 THÔNG BÁO: MIỄN PHÍ 100% GIÁ VÉ METRO SỐ 1 NGÀY 02/7/2026 🎉', 'thong-bao-mien-phi-100-gia-ve-metro-so-1-ngay-0272026', 'Chào mừng Kỷ niệm 50 năm ngày thành phố Sài Gòn – Gia Định chính thức vinh dự mang tên Chủ tịch Hồ Chí Minh, trong 02/7/2026, hành khách sử dụng tuyến Metro số 1 (Bến Thành – Suối Tiên) sẽ được miễn phí 100% giá vé', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Chào&nbsp;mừng&nbsp;Kỷ&nbsp;niệm&nbsp;50&nbsp;năm&nbsp;ngày&nbsp;thành&nbsp;phố&nbsp;Sài&nbsp;Gòn&nbsp;–&nbsp;Gia&nbsp;Định&nbsp;chính&nbsp;thức&nbsp;vinh&nbsp;dự&nbsp;mang&nbsp;tên&nbsp;Chủ&nbsp;tịch&nbsp;Hồ&nbsp;Chí&nbsp;Minh,&nbsp;trong&nbsp;02/7/2026,&nbsp;hành&nbsp;khách&nbsp;sử&nbsp;dụng&nbsp;tuyến&nbsp;Metro&nbsp;số&nbsp;1&nbsp;(Bến&nbsp;Thành&nbsp;–&nbsp;Suối&nbsp;Tiên)&nbsp;sẽ&nbsp;được&nbsp;miễn&nbsp;phí&nbsp;100%&nbsp;giá&nbsp;vé.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">🕔&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tăng&nbsp;cường&nbsp;vận&nbsp;hành&nbsp;phục&nbsp;vụ&nbsp;người&nbsp;dân</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">🔹&nbsp;Thời&nbsp;gian&nbsp;hoạt&nbsp;động:&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">05:00&nbsp;–&nbsp;23:00</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">🔹&nbsp;Tổng&nbsp;số&nbsp;chuyến:&nbsp;248&nbsp;lượt&nbsp;tàu/ngày</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">🔹&nbsp;Riêng&nbsp;từ&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">20:30&nbsp;–&nbsp;22:00</strong><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">,&nbsp;giãn&nbsp;cách&nbsp;tàu&nbsp;chỉ&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">06&nbsp;phút/chuyến</strong><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">&nbsp;để&nbsp;phục&nbsp;vụ&nbsp;nhu&nbsp;cầu&nbsp;di&nbsp;chuyển&nbsp;và&nbsp;xem&nbsp;pháo&nbsp;hoa.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">🎫&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">03&nbsp;cách&nbsp;đi&nbsp;Metro&nbsp;miễn&nbsp;phí&nbsp;trong&nbsp;ngày&nbsp;02/7/2026:</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">✅&nbsp;Cách&nbsp;1:&nbsp;Sử&nbsp;dụng&nbsp;thẻ&nbsp;Căn&nbsp;cước/Căn&nbsp;cước&nbsp;công&nbsp;dân&nbsp;gắn&nbsp;chip&nbsp;để&nbsp;quét&nbsp;trực&nbsp;tiếp&nbsp;tại&nbsp;cổng&nbsp;soát&nbsp;vé.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">✅&nbsp;Cách&nbsp;2:&nbsp;Sử&nbsp;dụng&nbsp;mã&nbsp;QR&nbsp;HCMC&nbsp;METRO&nbsp;trên&nbsp;ứng&nbsp;dụng&nbsp;HCMC&nbsp;Metro&nbsp;HURC&nbsp;để&nbsp;quét&nbsp;tại&nbsp;cổng&nbsp;soát&nbsp;vé.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">✅&nbsp;Cách&nbsp;3:&nbsp;Nhận&nbsp;vé&nbsp;giấy&nbsp;QR&nbsp;miễn&nbsp;phí&nbsp;tại&nbsp;các&nbsp;máy&nbsp;Kiosk&nbsp;tự&nbsp;động&nbsp;trong&nbsp;nhà&nbsp;ga&nbsp;và&nbsp;quét&nbsp;để&nbsp;đi&nbsp;tàu.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">⚠️&nbsp;Lưu&nbsp;ý:</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">❗️Chương&nbsp;trình&nbsp;miễn&nbsp;phí&nbsp;chỉ&nbsp;áp&nbsp;dụng&nbsp;khi&nbsp;sử&nbsp;dụng&nbsp;1&nbsp;trong&nbsp;3&nbsp;phương&nbsp;thức&nbsp;trên.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">❗️Nếu&nbsp;hành&nbsp;khách&nbsp;mua&nbsp;vé&nbsp;theo&nbsp;hình&nbsp;thức&nbsp;thông&nbsp;thường,&nbsp;hệ&nbsp;thống&nbsp;vẫn&nbsp;tính&nbsp;phí&nbsp;và&nbsp;không&nbsp;thực&nbsp;hiện&nbsp;hoàn&nbsp;tiền.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">❗️&nbsp;Chức&nbsp;năng&nbsp;&quot;QR&nbsp;HCMC&nbsp;METRO&quot;&nbsp;trên&nbsp;ứng&nbsp;dụng&nbsp;HCMC&nbsp;Metro&nbsp;HURC&nbsp;sẽ&nbsp;được&nbsp;kích&nbsp;hoạt&nbsp;từ&nbsp;ngày&nbsp;02/7/2026&nbsp;và&nbsp;chỉ&nbsp;có&nbsp;hiệu&nbsp;lực&nbsp;sử&nbsp;dụng&nbsp;trong&nbsp;ngày.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Trong&nbsp;trường&nbsp;hợp&nbsp;cần&nbsp;hỗ&nbsp;trợ,&nbsp;Quý&nbsp;hành&nbsp;khách&nbsp;vui&nbsp;lòng&nbsp;liên&nbsp;hệ&nbsp;nhân&nbsp;viên&nbsp;tại&nbsp;ga&nbsp;hoặc&nbsp;Tổng&nbsp;đài&nbsp;hỗ&nbsp;trợ:&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">1900&nbsp;638&nbsp;885.</strong></p>', 'PUBLISHED', '2026-07-08 10:55:00', '8e66c1a7-9a47-46fa-8979-71f0ed6e5423', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');


--
-- TOC entry 5119 (class 0 OID 17961)
-- Dependencies: 229
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5111 (class 0 OID 17707)
-- Dependencies: 221
-- Data for Name: banners; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.banners (id, created_at, updated_at, deleted_at, title, redirect_url, display_order, is_active, image_id, created_by) VALUES ('d4768f11-a3e9-4275-9b9e-a992bbb0f6f0', '2026-06-23 11:28:42.558581', '2026-07-08 10:44:06.409244', NULL, 'Metro Số 1', NULL, 1, true, '91f6737d-ccdf-4002-82a1-139579d73eb5', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');


--
-- TOC entry 5116 (class 0 OID 17890)
-- Dependencies: 226
-- Data for Name: blacklisted_tokens; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5115 (class 0 OID 17837)
-- Dependencies: 225
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5114 (class 0 OID 17801)
-- Dependencies: 224
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5112 (class 0 OID 17725)
-- Dependencies: 222
-- Data for Name: media; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('c8dedbb6-65e2-407a-976e-f8b676053a94', '2026-07-13 09:09:48.133758', '2026-07-13 09:09:48.133758', NULL, 'image-1783908588105-602244996.png', 'news-3.png', 'image/png', 454304, '/uploads/image-1783908588105-602244996.png', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('abd342bc-78ce-4b5f-acfb-578fb0b42c58', '2026-07-13 09:23:02.516322', '2026-07-13 09:23:02.516322', NULL, 'image-1783909382502-724066241.png', 'thumbnail3.png', 'image/png', 99235, '/uploads/image-1783909382502-724066241.png', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('aef03c0a-f3da-44c7-aa6b-3302886de810', '2026-07-13 09:35:42.317712', '2026-07-13 09:35:42.317712', NULL, 'image-1783910142312-181077110.jpg', 'news-2.jpg', 'image/jpeg', 102222, '/uploads/image-1783910142312-181077110.jpg', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('d6a53006-ce07-426f-a7eb-2ae631c59166', '2026-07-13 09:38:23.583308', '2026-07-13 09:38:23.583308', NULL, 'image-1783910303571-411928481.jpg', 'z7881835557681_dd45fe16a145fb6b18f6742496f7c1e6.jpg', 'image/jpeg', 127562, '/uploads/image-1783910303571-411928481.jpg', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('a28a68f7-2c31-457f-9afc-c39634a4ba47', '2026-07-13 09:38:38.181123', '2026-07-13 09:38:38.181123', NULL, 'image-1783910318177-897219571.jpg', 'suc-song-cua-tre-em-viet-nam-thoi-chien-1464787482.jpg', 'image/jpeg', 33340, '/uploads/image-1783910318177-897219571.jpg', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('0ff468be-2042-47b1-828c-ffb4bf7f5bff', '2026-07-13 09:44:59.457863', '2026-07-13 09:44:59.457863', NULL, 'image-1783910699454-905993513.jpg', 'news-6.jpg', 'image/jpeg', 62896, '/uploads/image-1783910699454-905993513.jpg', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('0cba1cb7-e0fa-4c0e-b65e-8a4ac6da45d9', '2026-07-13 09:03:19.814268', '2026-07-13 09:03:19.814268', NULL, 'image-1783908199811-524408068.jpg', 'thumbnail1.jpg', 'image/jpeg', 30159, '/uploads/image-1783908199811-524408068.jpg', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('2950d114-c3bf-40b2-805b-9e8789f5a3cf', '2026-07-13 09:18:41.966229', '2026-07-13 09:18:41.966229', NULL, 'image-1783909121961-693075976.png', 'thumbnail2.png', 'image/png', 27409, '/uploads/image-1783909121961-693075976.png', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('91f6737d-ccdf-4002-82a1-139579d73eb5', '2026-07-08 10:44:03.331263', '2026-07-08 10:44:03.331263', NULL, 'image-1783482243312-311769604.png', 'banner-1.png', 'image/png', 407480, '/uploads/image-1783482243312-311769604.png', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('3ea8f30d-4f71-47e0-87fc-b1d098ee9e4f', '2026-07-09 16:41:30.946943', '2026-07-09 16:41:30.946943', NULL, 'image-1783590090931-649010359.png', 'OPH.png', 'image/png', 179100, '/uploads/image-1783590090931-649010359.png', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('79e05d8a-e12d-48db-9b1a-75702e04edaf', '2026-07-09 16:52:58.152369', '2026-07-09 16:52:58.152369', NULL, 'image-1783590778137-45472256.png', 'BTN.png', 'image/png', 106741, '/uploads/image-1783590778137-45472256.png', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('4986552a-745f-4315-96b2-57dc9bd68943', '2026-07-09 16:56:24.448848', '2026-07-09 16:56:24.448848', NULL, 'image-1783590984432-286861407.png', 'BSN.png', 'image/png', 176782, '/uploads/image-1783590984432-286861407.png', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('dba63365-2ee5-47ef-aadd-3a52c4bd7be8', '2026-07-10 15:23:31.475593', '2026-07-10 15:23:31.475593', NULL, 'image-1783671811465-554009365.png', 'VTP.png', 'image/png', 185532, '/uploads/image-1783671811465-554009365.png', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('bb5bb9a5-23a3-4a06-9a77-b9336042a778', '2026-07-10 15:24:01.531819', '2026-07-10 15:24:01.531819', NULL, 'image-1783671841518-203020164.png', 'TCN.png', 'image/png', 181210, '/uploads/image-1783671841518-203020164.png', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('47af0f60-0f93-4132-a331-38b47acdcf90', '2026-07-10 15:24:31.147638', '2026-07-10 15:24:31.147638', NULL, 'image-1783671871145-415525535.png', 'ANP.png', 'image/png', 178222, '/uploads/image-1783671871145-415525535.png', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('e53dcadf-31fd-489e-9cc1-60a2055f134a', '2026-07-10 15:24:46.550142', '2026-07-10 15:24:46.550142', NULL, 'image-1783671886538-160581760.png', 'TDN.png', 'image/png', 181603, '/uploads/image-1783671886538-160581760.png', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('f31f3317-17eb-4b34-a1f3-b92d221070e1', '2026-07-10 15:25:17.499435', '2026-07-10 15:25:17.499435', NULL, 'image-1783671917487-847484184.png', 'RCC.png', 'image/png', 181132, '/uploads/image-1783671917487-847484184.png', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('497e3217-c1cf-4f8d-bb22-9e6ca22dee93', '2026-07-10 15:25:52.856464', '2026-07-10 15:25:52.856464', NULL, 'image-1783671952843-645048419.png', 'PCL.png', 'image/png', 188049, '/uploads/image-1783671952843-645048419.png', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('b9339027-b816-4168-b8c9-40e9ffdff6e1', '2026-07-10 15:26:20.538014', '2026-07-10 15:26:20.538014', NULL, 'image-1783671980525-51354699.png', 'BTI.png', 'image/png', 185413, '/uploads/image-1783671980525-51354699.png', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('5b21048c-4e1f-4357-b09d-dac9b08fdd87', '2026-07-10 15:26:38.788547', '2026-07-10 15:26:38.788547', NULL, 'image-1783671998786-902510918.png', 'TDC.png', 'image/png', 178884, '/uploads/image-1783671998786-902510918.png', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('f53ede0a-d3bd-405c-b2ff-d8bdba8570f0', '2026-07-10 15:26:51.937659', '2026-07-10 15:26:51.937659', NULL, 'image-1783672011919-532969997.png', 'HTP.png', 'image/png', 181891, '/uploads/image-1783672011919-532969997.png', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('24402595-52ca-48ba-a2d7-cf126f0ed09a', '2026-07-10 15:27:09.321738', '2026-07-10 15:27:09.321738', NULL, 'image-1783672029309-64668715.png', 'NUS.png', 'image/png', 184048, '/uploads/image-1783672029309-64668715.png', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('2f0d84ff-9dd4-411c-897c-c6628e93b6aa', '2026-07-10 15:27:18.415453', '2026-07-10 15:27:18.415453', NULL, 'image-1783672038406-888545451.png', 'STT.png', 'image/png', 107943, '/uploads/image-1783672038406-888545451.png', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('d277d837-a6e0-497f-afbf-df3d8b7c9762', '2026-07-10 15:33:55.41586', '2026-07-10 15:34:07.841379', NULL, 'image-1783672435404-149846296.png', 'Bang_gia_ve.png', 'image/png', 84722, '/uploads/image-1783672435404-149846296.png', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('2bc6e712-4b56-49cd-abe5-d9c8125660b1', '2026-07-10 16:26:44.917358', '2026-07-10 16:26:44.917358', NULL, 'image-1783675604914-462820256.png', 'hero-metro.png', 'image/png', 4267, '/uploads/image-1783675604914-462820256.png', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('2863f7fa-8112-45b0-be79-61e3313fa58a', '2026-07-13 08:55:00.121949', '2026-07-13 08:55:00.121949', NULL, 'image-1783907700115-10695142.jpg', 'news-1.jpg', 'image/jpeg', 102315, '/uploads/image-1783907700115-10695142.jpg', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('c273704c-8ff3-4bc3-85a3-7c894c5e20e4', '2026-07-13 09:28:14.957649', '2026-07-13 09:28:14.957649', NULL, 'image-1783909694954-811879729.jpg', 'tre em.jpg', 'image/jpeg', 28582, '/uploads/image-1783909694954-811879729.jpg', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('ea1d4456-ce11-4d80-8582-5bb3cc2e2e6f', '2026-07-13 09:36:51.172232', '2026-07-13 09:36:51.172232', NULL, 'image-1783910211155-791613882.png', 'news-4.png', 'image/png', 295161, '/uploads/image-1783910211155-791613882.png', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('1ddeb0f7-21c6-4b11-ab6a-5b5ca77b013f', '2026-07-13 09:41:36.636766', '2026-07-13 09:41:36.636766', NULL, 'image-1783910496622-425692067.jpg', 'news-5.jpg', 'image/jpeg', 86334, '/uploads/image-1783910496622-425692067.jpg', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('8e66c1a7-9a47-46fa-8979-71f0ed6e5423', '2026-07-13 09:46:40.32009', '2026-07-13 09:46:40.32009', NULL, 'image-1783910800313-550312523.jpg', 'thumbnail4.jpg', 'image/jpeg', 53640, '/uploads/image-1783910800313-550312523.jpg', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');
INSERT INTO public.media (id, created_at, updated_at, deleted_at, file_name, original_name, mime_type, size, url, uploaded_by) VALUES ('43e0aa73-8092-4bba-9393-e157a9ce8d1e', '2026-07-13 09:49:40.657269', '2026-07-13 09:49:40.657269', NULL, 'image-1783910980655-347312400.jpg', 'uploaded-dataimages-201606-original-_images1568950_pnta5192_1464783213_660x0.jpg', 'image/jpeg', 81506, '/uploads/image-1783910980655-347312400.jpg', '7e7c93bd-b455-4044-946e-7c7dfe1e328d');


--
-- TOC entry 5117 (class 0 OID 17903)
-- Dependencies: 227
-- Data for Name: stations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.stations (id, created_at, updated_at, deleted_at, name, code, content, display_order, schedule_image_id) VALUES ('5cd0bd4c-2d07-4265-8712-4ec873e179a7', '2026-06-16 16:14:21.549374', '2026-07-09 16:56:27.900711', NULL, 'Ga Ba Son', 'S03', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Vị&nbsp;trí:&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Ga&nbsp;Ba&nbsp;Son</strong><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">&nbsp;là&nbsp;một&nbsp;trong&nbsp;những&nbsp;nhà&nbsp;ga&nbsp;ngầm&nbsp;của&nbsp;Tuyến&nbsp;Metro&nbsp;số&nbsp;1&nbsp;nằm&nbsp;tại&nbsp;khu&nbsp;đô&nbsp;thị&nbsp;Vinhomes&nbsp;Golden&nbsp;River&nbsp;và&nbsp;Grand&nbsp;Marina&nbsp;Saigon,&nbsp;Quận&nbsp;1,&nbsp;Thành&nbsp;phố&nbsp;Hồ&nbsp;Chí&nbsp;Minh.&nbsp;Ga&nbsp;được&nbsp;thiết&nbsp;kế&nbsp;ngầm&nbsp;với&nbsp;màu&nbsp;sắc&nbsp;chủ&nbsp;đạo&nbsp;là&nbsp;màu&nbsp;xanh&nbsp;và&nbsp;các&nbsp;thiết&nbsp;kế&nbsp;hình&nbsp;lượn&nbsp;sóng&nbsp;tại&nbsp;Tầng&nbsp;1,&nbsp;giúp&nbsp;khách&nbsp;đi&nbsp;tàu&nbsp;hình&nbsp;dung&nbsp;được&nbsp;sự&nbsp;tươi&nbsp;mát&nbsp;của&nbsp;dòng&nbsp;Sông&nbsp;Sài&nbsp;Gòn.&nbsp;Kết&nbsp;cấu:&nbsp;Bao&nbsp;gồm&nbsp;2&nbsp;tầng&nbsp;ngầm:</span></p><ul><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;hầm&nbsp;B1:&nbsp;sảnh&nbsp;đợi,&nbsp;máy&nbsp;bán&nbsp;vé&nbsp;tự&nbsp;động,&nbsp;máy&nbsp;điều&nbsp;chỉnh&nbsp;giá&nbsp;vé,&nbsp;phòng&nbsp;hướng&nbsp;dẫn&nbsp;thông&nbsp;tin&nbsp;cho&nbsp;hành&nbsp;khách,&nbsp;nhà&nbsp;vệ&nbsp;sinh</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;hầm&nbsp;B2:&nbsp;khu&nbsp;vực&nbsp;ke&nbsp;ga,&nbsp;nơi&nbsp;tàu&nbsp;dừng,&nbsp;đỗ&nbsp;để&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;hầm&nbsp;B3:&nbsp;khu&nbsp;vực&nbsp;kỹ&nbsp;thuật,&nbsp;nội&nbsp;bộ&nbsp;không&nbsp;dùng&nbsp;cho&nbsp;hành&nbsp;khách</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;hầm&nbsp;B4:&nbsp;khu&nbsp;vực&nbsp;ke&nbsp;ga,&nbsp;nơi&nbsp;tàu&nbsp;dừng,&nbsp;đỗ&nbsp;để&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách</span></li></ul><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Có&nbsp;5&nbsp;lối&nbsp;lên&nbsp;xuống,&nbsp;hiện&nbsp;hành&nbsp;khách&nbsp;có&nbsp;thể&nbsp;sử&nbsp;dụng&nbsp;các&nbsp;lối&nbsp;lên&nbsp;xuống&nbsp;như&nbsp;sau:</span></p><ul><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Lối&nbsp;số&nbsp;1&nbsp;nằm&nbsp;trên&nbsp;vỉa&nbsp;hè&nbsp;cập&nbsp;tòa&nbsp;nhà&nbsp;VPBank&nbsp;Tower&nbsp;Sài&nbsp;Gòn.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Lối&nbsp;số&nbsp;2&nbsp;nằm&nbsp;cập&nbsp;vỉa&nbsp;hè&nbsp;bên&nbsp;phía&nbsp;Công&nbsp;ty&nbsp;Ba&nbsp;Son.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Lối&nbsp;số&nbsp;3&nbsp;nằm&nbsp;cập&nbsp;bờ&nbsp;sông&nbsp;Sài&nbsp;Gòn.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Lối&nbsp;số&nbsp;4&nbsp;và&nbsp;5&nbsp;kết&nbsp;nối&nbsp;với&nbsp;dự&nbsp;án&nbsp;tòa&nbsp;nhà&nbsp;văn&nbsp;phòng&nbsp;thương&nbsp;mại&nbsp;dịch&nbsp;vụ&nbsp;Khu&nbsp;phức&nbsp;hợp&nbsp;Sài&nbsp;Gòn&nbsp;-&nbsp;Ba&nbsp;Son.&nbsp;Kết&nbsp;nối:&nbsp;Hành&nbsp;khách&nbsp;có&nbsp;thể&nbsp;sử&nbsp;dụng&nbsp;xe&nbsp;buýt&nbsp;công&nbsp;cộng&nbsp;để&nbsp;kết&nbsp;nối&nbsp;với&nbsp;nhà&nbsp;ga&nbsp;Ba&nbsp;Son,&nbsp;cụ&nbsp;thể:</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tuyến&nbsp;xe&nbsp;buýt&nbsp;số:&nbsp;11,&nbsp;30,&nbsp;44,&nbsp;53,&nbsp;56,&nbsp;88,&nbsp;155.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tại&nbsp;trạm&nbsp;Ba&nbsp;Son&nbsp;(cách&nbsp;ga&nbsp;Ba&nbsp;Son&nbsp;100m),&nbsp;có&nbsp;các&nbsp;tuyến&nbsp;xe&nbsp;buýt:&nbsp;44,&nbsp;53,&nbsp;56,&nbsp;88.</span></li></ul>', 3, '4986552a-745f-4315-96b2-57dc9bd68943');
INSERT INTO public.stations (id, created_at, updated_at, deleted_at, name, code, content, display_order, schedule_image_id) VALUES ('e6eb4870-4eec-40da-b2af-4a48fa0ff652', '2026-06-16 16:14:21.549374', '2026-07-10 15:24:48.930501', NULL, 'Ga Thảo Điền', 'S06', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Vị&nbsp;trí:&nbsp;Ga&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Thảo&nbsp;Điền</strong><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">&nbsp;là&nbsp;nhà&nbsp;ga&nbsp;loại&nbsp;A&nbsp;nằm&nbsp;tại&nbsp;phường&nbsp;Thảo&nbsp;Điền,&nbsp;thành&nbsp;phố&nbsp;Thủ&nbsp;Đức,&nbsp;TP.HCM,&nbsp;có&nbsp;cầu&nbsp;bộ&nbsp;hành&nbsp;đi&nbsp;bộ&nbsp;băng&nbsp;qua&nbsp;Võ&nbsp;Nguyên&nbsp;Giáp&nbsp;(Xa&nbsp;lộ&nbsp;Hà&nbsp;Nội)&nbsp;và&nbsp;kết&nbsp;nối&nbsp;với&nbsp;bãi&nbsp;đỗ&nbsp;xe.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Kết&nbsp;cấu:&nbsp;Bao&nbsp;gồm&nbsp;3&nbsp;tầng&nbsp;:</span></p><ul><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;trệt:&nbsp;khu&nbsp;vực&nbsp;bãi&nbsp;đậu&nbsp;xe&nbsp;và&nbsp;khu&nbsp;vực&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách&nbsp;di&nbsp;chuyển&nbsp;bằng&nbsp;các&nbsp;phương&nbsp;tiện&nbsp;khác&nbsp;để&nbsp;đi&nbsp;tàu.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;2:&nbsp;sảnh&nbsp;đợi,&nbsp;máy&nbsp;bán&nbsp;vé&nbsp;tự&nbsp;động,&nbsp;máy&nbsp;điều&nbsp;chỉnh&nbsp;giá&nbsp;vé,&nbsp;phòng&nbsp;hướng&nbsp;dẫn&nbsp;thông&nbsp;tin&nbsp;cho&nbsp;hành&nbsp;khách,&nbsp;nhà&nbsp;vệ&nbsp;sinh.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;3:&nbsp;khu&nbsp;vực&nbsp;ke&nbsp;ga,&nbsp;nơi&nbsp;tàu&nbsp;dừng,&nbsp;đỗ&nbsp;để&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách.&nbsp;*Tầng&nbsp;2&nbsp;được&nbsp;kết&nbsp;nối&nbsp;với&nbsp;cầu&nbsp;bộ&nbsp;hành&nbsp;đi&nbsp;bộ&nbsp;băng&nbsp;qua&nbsp;Võ&nbsp;Nguyên&nbsp;Giáp&nbsp;(Xa&nbsp;lộ&nbsp;Hà&nbsp;Nội)&nbsp;và&nbsp;kết&nbsp;nối&nbsp;với&nbsp;bãi&nbsp;đỗ&nbsp;xe.&nbsp;Kết&nbsp;nối:&nbsp;Hành&nbsp;khách&nbsp;có&nbsp;thể&nbsp;sử&nbsp;dụng&nbsp;xe&nbsp;buýt&nbsp;công&nbsp;cộng&nbsp;để&nbsp;kết&nbsp;nối&nbsp;với&nbsp;nhà&nbsp;ga&nbsp;Thảo&nbsp;Điền,&nbsp;cụ&nbsp;thể&nbsp;43,&nbsp;56,&nbsp;53,&nbsp;150,&nbsp;67,&nbsp;60-3,&nbsp;60-7,&nbsp;72-1,&nbsp;157.&nbsp;·&nbsp;Tại&nbsp;trạm&nbsp;Quốc&nbsp;Hương&nbsp;(cách&nbsp;ga&nbsp;Thảo&nbsp;Điền&nbsp;130m),&nbsp;có&nbsp;tuyến&nbsp;xe&nbsp;buýt:&nbsp;43.&nbsp;·&nbsp;Tại&nbsp;trạm&nbsp;Cầu&nbsp;Đen&nbsp;(cách&nbsp;ga&nbsp;Thảo&nbsp;Điền&nbsp;120m),&nbsp;có&nbsp;các&nbsp;tuyến&nbsp;xe&nbsp;buýt:&nbsp;06,&nbsp;10,&nbsp;104,&nbsp;150,&nbsp;30,&nbsp;52,&nbsp;53,&nbsp;55,&nbsp;56,&nbsp;60-7,&nbsp;67,&nbsp;72-1.</span></li></ul>', 6, 'e53dcadf-31fd-489e-9cc1-60a2055f134a');
INSERT INTO public.stations (id, created_at, updated_at, deleted_at, name, code, content, display_order, schedule_image_id) VALUES ('6028db19-e344-485c-b120-eda9b4161bb5', '2026-06-16 16:14:21.549374', '2026-07-10 15:25:07.477503', NULL, 'Ga An Phú', 'S07', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Vị&nbsp;trí:&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Ga&nbsp;An&nbsp;Phú</strong><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">&nbsp;là&nbsp;nhà&nbsp;ga&nbsp;loại&nbsp;C,&nbsp;nằm&nbsp;tại&nbsp;phường&nbsp;Thảo&nbsp;Điền,&nbsp;thành&nbsp;phố&nbsp;Thủ&nbsp;Đức,&nbsp;TP.HCM.&nbsp;Kết&nbsp;cấu:</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Bao&nbsp;gồm&nbsp;3&nbsp;tầng&nbsp;:</span></p><ul><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;trệt:&nbsp;khu&nbsp;vực&nbsp;bãi&nbsp;đậu&nbsp;xe&nbsp;và&nbsp;khu&nbsp;vực&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách&nbsp;di&nbsp;chuyển&nbsp;bằng&nbsp;các&nbsp;phương&nbsp;tiện&nbsp;khác&nbsp;để&nbsp;đi&nbsp;tàu.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;2:&nbsp;sảnh&nbsp;đợi,&nbsp;máy&nbsp;bán&nbsp;vé&nbsp;tự&nbsp;động,&nbsp;máy&nbsp;điều&nbsp;chỉnh&nbsp;giá&nbsp;vé,&nbsp;phòng&nbsp;hướng&nbsp;dẫn&nbsp;thông&nbsp;tin&nbsp;cho&nbsp;hành&nbsp;khách,&nbsp;nhà&nbsp;vệ&nbsp;sinh.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;3:&nbsp;khu&nbsp;vực&nbsp;ke&nbsp;ga,&nbsp;nơi&nbsp;tàu&nbsp;dừng,&nbsp;đỗ&nbsp;để&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách.&nbsp;Kết&nbsp;nối:&nbsp;Hành&nbsp;khách&nbsp;có&nbsp;thể&nbsp;sử&nbsp;dụng&nbsp;xe&nbsp;buýt&nbsp;công&nbsp;cộng&nbsp;để&nbsp;kết&nbsp;nối&nbsp;với&nbsp;nhà&nbsp;ga&nbsp;An&nbsp;Phú,&nbsp;cụ&nbsp;thể&nbsp;M1,&nbsp;M2,&nbsp;M19,&nbsp;06,&nbsp;10,&nbsp;11,&nbsp;30,&nbsp;52,&nbsp;53,&nbsp;55,&nbsp;56,&nbsp;150,&nbsp;67,&nbsp;60-3,&nbsp;60-7,&nbsp;72-1,&nbsp;104,&nbsp;153,&nbsp;154.&nbsp;Tại&nbsp;trạm&nbsp;Mero&nbsp;An&nbsp;Phú&nbsp;(cách&nbsp;ga&nbsp;An&nbsp;Phú&nbsp;120m),&nbsp;có&nbsp;các&nbsp;tuyến&nbsp;xe&nbsp;buýt:&nbsp;06,&nbsp;10,&nbsp;104,&nbsp;150,&nbsp;30,&nbsp;52,&nbsp;55,&nbsp;56,&nbsp;60-3,&nbsp;60-7,&nbsp;67.</span></li></ul>', 7, '47af0f60-0f93-4132-a331-38b47acdcf90');
INSERT INTO public.stations (id, created_at, updated_at, deleted_at, name, code, content, display_order, schedule_image_id) VALUES ('c7c309ff-2793-4cce-8fa0-6783654a06f7', '2026-06-16 16:14:21.549374', '2026-07-10 15:26:22.813558', NULL, 'Ga Bình Thái', 'S10', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Vị&nbsp;trí:&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Ga&nbsp;Bình&nbsp;Thái</strong><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">&nbsp;là&nbsp;nhà&nbsp;ga&nbsp;loại&nbsp;A,&nbsp;một&nbsp;trong&nbsp;những&nbsp;nhà&nbsp;ga&nbsp;tàu&nbsp;điện&nbsp;của&nbsp;Tuyến&nbsp;Metro&nbsp;số&nbsp;1,&nbsp;nằm&nbsp;tại&nbsp;phường&nbsp;Trường&nbsp;Thọ,&nbsp;thành&nbsp;phố&nbsp;Thủ&nbsp;Đức,&nbsp;TP.HCM&nbsp;cách&nbsp;trường&nbsp;Đại&nbsp;học&nbsp;Kiến&nbsp;trúc&nbsp;TP.HCM&nbsp;(950m&nbsp;–&nbsp;10&nbsp;phút&nbsp;đi&nbsp;bộ).</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Kết&nbsp;cấu:&nbsp;Bao&nbsp;gồm&nbsp;3&nbsp;tầng&nbsp;:</span></p><ul><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;trệt:&nbsp;khu&nbsp;vực&nbsp;bãi&nbsp;đậu&nbsp;xe&nbsp;và&nbsp;khu&nbsp;vực&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách&nbsp;di&nbsp;chuyển&nbsp;bằng&nbsp;các&nbsp;phương&nbsp;tiện&nbsp;khác&nbsp;để&nbsp;đi&nbsp;tàu.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;2:&nbsp;sảnh&nbsp;đợi,&nbsp;máy&nbsp;bán&nbsp;vé&nbsp;tự&nbsp;động,&nbsp;máy&nbsp;điều&nbsp;chỉnh&nbsp;giá&nbsp;vé,&nbsp;phòng&nbsp;hướng&nbsp;dẫn&nbsp;thông&nbsp;tin&nbsp;cho&nbsp;hành&nbsp;khách,&nbsp;nhà&nbsp;vệ&nbsp;sinh.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;3:&nbsp;khu&nbsp;vực&nbsp;ke&nbsp;ga,&nbsp;nơi&nbsp;tàu&nbsp;dừng,&nbsp;đỗ&nbsp;để&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách.&nbsp;Kết&nbsp;nối:&nbsp;Hành&nbsp;khách&nbsp;có&nbsp;thể&nbsp;sử&nbsp;dụng&nbsp;xe&nbsp;buýt&nbsp;công&nbsp;cộng&nbsp;để&nbsp;kết&nbsp;nối&nbsp;với&nbsp;nhà&nbsp;ga&nbsp;Bình&nbsp;Thái,&nbsp;cụ&nbsp;thể:&nbsp;Tuyến&nbsp;xe&nbsp;buýt&nbsp;số&nbsp;56,&nbsp;150,&nbsp;67,&nbsp;60-3,&nbsp;60-7,&nbsp;162,&nbsp;163,&nbsp;168,&nbsp;169.</span></li></ul>', 10, 'b9339027-b816-4168-b8c9-40e9ffdff6e1');
INSERT INTO public.stations (id, created_at, updated_at, deleted_at, name, code, content, display_order, schedule_image_id) VALUES ('fcde3ed3-7a30-485a-9fc8-c3ada4b0567a', '2026-06-16 16:14:21.549374', '2026-07-10 15:23:34.795338', NULL, 'Ga Văn Thánh', 'S04', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Vị&nbsp;trí:&nbsp;Ga&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Văn&nbsp;Thánh</strong><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">&nbsp;là&nbsp;nhà&nbsp;ga&nbsp;loại&nbsp;A&nbsp;một&nbsp;trong&nbsp;những&nbsp;nhà&nbsp;ga&nbsp;trên&nbsp;cao&nbsp;của&nbsp;Tuyến&nbsp;số&nbsp;1,&nbsp;là&nbsp;nhà&nbsp;ga&nbsp;trên&nbsp;cao&nbsp;chuyển&nbsp;tiếp&nbsp;xuống&nbsp;đoạn&nbsp;ngầm&nbsp;tại&nbsp;Ga&nbsp;Ba&nbsp;Son.&nbsp;Kết&nbsp;cấu:&nbsp;Bao&nbsp;gồm&nbsp;3&nbsp;tầng&nbsp;:</span></p><ul><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;trệt:&nbsp;khu&nbsp;vực&nbsp;bãi&nbsp;đậu&nbsp;xe&nbsp;và&nbsp;khu&nbsp;vực&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách&nbsp;di&nbsp;chuyển&nbsp;bằng&nbsp;các&nbsp;phương&nbsp;tiện&nbsp;khác&nbsp;để&nbsp;đi&nbsp;tàu.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;2:&nbsp;sảnh&nbsp;đợi,&nbsp;máy&nbsp;bán&nbsp;vé&nbsp;tự&nbsp;động,&nbsp;máy&nbsp;điều&nbsp;chỉnh&nbsp;giá&nbsp;vé,&nbsp;phòng&nbsp;hướng&nbsp;dẫn&nbsp;thông&nbsp;tin&nbsp;cho&nbsp;hành&nbsp;khách,&nbsp;nhà&nbsp;vệ&nbsp;sinh.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;3:&nbsp;khu&nbsp;vực&nbsp;ke&nbsp;ga,&nbsp;nơi&nbsp;tàu&nbsp;dừng,&nbsp;đỗ&nbsp;để&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách.&nbsp;Kết&nbsp;nối:&nbsp;Hành&nbsp;khách&nbsp;có&nbsp;thể&nbsp;sử&nbsp;dụng&nbsp;xe&nbsp;buýt&nbsp;công&nbsp;cộng&nbsp;để&nbsp;kết&nbsp;nối&nbsp;với&nbsp;nhà&nbsp;ga&nbsp;Văn&nbsp;Thánh,&nbsp;cụ&nbsp;thể:</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tuyến&nbsp;M17:&nbsp;Chung&nbsp;cư&nbsp;Ngô&nbsp;Tất&nbsp;Tố&nbsp;-&nbsp;Ngã&nbsp;tư&nbsp;Hàng&nbsp;Xanh.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tuyến&nbsp;M18:&nbsp;Ga&nbsp;Văn&nbsp;Thánh&nbsp;-&nbsp;Vinhomes&nbsp;central&nbsp;Park.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tuyến&nbsp;xe&nbsp;buýt&nbsp;số:159,160.</span></li></ul>', 4, 'dba63365-2ee5-47ef-aadd-3a52c4bd7be8');
INSERT INTO public.stations (id, created_at, updated_at, deleted_at, name, code, content, display_order, schedule_image_id) VALUES ('184f144d-c0f2-4751-9ce5-e7dc50c3bfa3', '2026-06-16 16:14:21.549374', '2026-07-10 15:24:05.846129', NULL, 'Ga Tân Cảng', 'S05', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Vị&nbsp;trí:&nbsp;Ga&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tân&nbsp;Cảng</strong><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">&nbsp;là&nbsp;nhà&nbsp;ga&nbsp;loại&nbsp;B,&nbsp;tọa&nbsp;lạc&nbsp;tại&nbsp;phường&nbsp;25,&nbsp;quận&nbsp;Bình&nbsp;Thạnh,&nbsp;TP.HCM,&nbsp;là&nbsp;nhà&nbsp;ga&nbsp;lớn&nbsp;nhất&nbsp;so&nbsp;với&nbsp;10&nbsp;nhà&nbsp;ga&nbsp;trên&nbsp;cao&nbsp;khác&nbsp;của&nbsp;tuyến&nbsp;đường&nbsp;sắt&nbsp;số&nbsp;1&nbsp;Bến&nbsp;Thành&nbsp;-&nbsp;Suối&nbsp;Tiên,&nbsp;với&nbsp;4&nbsp;làn&nbsp;tàu,&nbsp;6.200m2.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Kết&nbsp;cấu:&nbsp;Bao&nbsp;gồm&nbsp;3&nbsp;tầng&nbsp;:</span></p><ul><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;trệt:&nbsp;khu&nbsp;vực&nbsp;bãi&nbsp;đậu&nbsp;xe&nbsp;và&nbsp;khu&nbsp;vực&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách&nbsp;di&nbsp;chuyển&nbsp;bằng&nbsp;các&nbsp;phương&nbsp;tiện&nbsp;khác&nbsp;để&nbsp;đi&nbsp;tàu.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;2:&nbsp;sảnh&nbsp;đợi,&nbsp;máy&nbsp;bán&nbsp;vé&nbsp;tự&nbsp;động,&nbsp;máy&nbsp;điều&nbsp;chỉnh&nbsp;giá&nbsp;vé,&nbsp;phòng&nbsp;hướng&nbsp;dẫn&nbsp;thông&nbsp;tin&nbsp;cho&nbsp;hành&nbsp;khách,&nbsp;nhà&nbsp;vệ&nbsp;sinh.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;3:&nbsp;khu&nbsp;vực&nbsp;ke&nbsp;ga,&nbsp;nơi&nbsp;tàu&nbsp;dừng,&nbsp;đỗ&nbsp;để&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách.&nbsp;Kết&nbsp;nối:&nbsp;Hành&nbsp;khách&nbsp;có&nbsp;thể&nbsp;sử&nbsp;dụng&nbsp;xe&nbsp;buýt&nbsp;công&nbsp;cộng&nbsp;để&nbsp;kết&nbsp;nối&nbsp;với&nbsp;nhà&nbsp;ga&nbsp;Tân&nbsp;Cảng,&nbsp;cụ&nbsp;thể:&nbsp;30,&nbsp;53,&nbsp;160,&nbsp;161&nbsp;Tại&nbsp;trạm&nbsp;Công&nbsp;viên&nbsp;Cầu&nbsp;Sài&nbsp;Gòn&nbsp;(cách&nbsp;ga&nbsp;Tân&nbsp;Cảng&nbsp;70m),&nbsp;có&nbsp;các&nbsp;tuyến&nbsp;xe&nbsp;buýt:&nbsp;30,&nbsp;53,&nbsp;56.</span></li></ul>', 5, 'bb5bb9a5-23a3-4a06-9a77-b9336042a778');
INSERT INTO public.stations (id, created_at, updated_at, deleted_at, name, code, content, display_order, schedule_image_id) VALUES ('6d1c698e-f6ce-4833-b64b-0e57bc095eed', '2026-06-16 16:14:21.549374', '2026-07-10 15:25:20.583879', NULL, 'Ga Rạch Chiếc', 'S08', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Vị&nbsp;trí:&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Ga&nbsp;Rạch&nbsp;Chiếc</strong><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">&nbsp;là&nbsp;nhà&nbsp;ga&nbsp;loại&nbsp;A,&nbsp;một&nbsp;trong&nbsp;những&nbsp;nhà&nbsp;ga&nbsp;của&nbsp;Tuyến&nbsp;Metro&nbsp;số&nbsp;1,&nbsp;nằm&nbsp;tại&nbsp;phường&nbsp;An&nbsp;Phú,&nbsp;thành&nbsp;phố&nbsp;Thủ&nbsp;Đức,&nbsp;TP.HCM.&nbsp;Kết&nbsp;cấu:&nbsp;Bao&nbsp;gồm&nbsp;3&nbsp;tầng&nbsp;:</span></p><ul><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;trệt:&nbsp;khu&nbsp;vực&nbsp;bãi&nbsp;đậu&nbsp;xe&nbsp;và&nbsp;khu&nbsp;vực&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách&nbsp;di&nbsp;chuyển&nbsp;bằng&nbsp;các&nbsp;phương&nbsp;tiện&nbsp;khác&nbsp;để&nbsp;đi&nbsp;tàu.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;2:&nbsp;sảnh&nbsp;đợi,&nbsp;máy&nbsp;bán&nbsp;vé&nbsp;tự&nbsp;động,&nbsp;máy&nbsp;điều&nbsp;chỉnh&nbsp;giá&nbsp;vé,&nbsp;phòng&nbsp;hướng&nbsp;dẫn&nbsp;thông&nbsp;tin&nbsp;cho&nbsp;hành&nbsp;khách,&nbsp;nhà&nbsp;vệ&nbsp;sinh.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;3:&nbsp;khu&nbsp;vực&nbsp;ke&nbsp;ga,&nbsp;nơi&nbsp;tàu&nbsp;dừng,&nbsp;đỗ&nbsp;để&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách.&nbsp;Kết&nbsp;nối:&nbsp;Hành&nbsp;khách&nbsp;có&nbsp;thể&nbsp;sử&nbsp;dụng&nbsp;xe&nbsp;buýt&nbsp;công&nbsp;cộng&nbsp;để&nbsp;kết&nbsp;nối&nbsp;với&nbsp;nhà&nbsp;ga&nbsp;Rạch&nbsp;chiếc,&nbsp;cụ&nbsp;thể:&nbsp;Tuyến&nbsp;xe&nbsp;buýt&nbsp;số&nbsp;56,&nbsp;99,&nbsp;150,&nbsp;67,&nbsp;60-3,&nbsp;60-7,&nbsp;154.</span></li></ul>', 8, 'f31f3317-17eb-4b34-a1f3-b92d221070e1');
INSERT INTO public.stations (id, created_at, updated_at, deleted_at, name, code, content, display_order, schedule_image_id) VALUES ('197310e3-152d-4f8f-9543-0cdda1fb9952', '2026-06-16 16:14:21.549374', '2026-07-10 15:25:55.596169', NULL, 'Ga Phước Long', 'S09', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Vị&nbsp;trí:&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Ga&nbsp;Phước&nbsp;Long</strong><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">&nbsp;là&nbsp;nhà&nbsp;ga&nbsp;loại&nbsp;A,&nbsp;một&nbsp;trong&nbsp;những&nbsp;nhà&nbsp;ga&nbsp;của&nbsp;Tuyến&nbsp;số&nbsp;1,&nbsp;nằm&nbsp;tại&nbsp;cảng&nbsp;Phước&nbsp;Long,&nbsp;phường&nbsp;Trường&nbsp;Thọ,&nbsp;thành&nbsp;phố&nbsp;Thủ&nbsp;Đức,&nbsp;TP.HCM.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Kết&nbsp;cấu:&nbsp;Bao&nbsp;gồm&nbsp;3&nbsp;tầng&nbsp;:</span></p><ul><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;trệt:&nbsp;khu&nbsp;vực&nbsp;bãi&nbsp;đậu&nbsp;xe&nbsp;và&nbsp;khu&nbsp;vực&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách&nbsp;di&nbsp;chuyển&nbsp;bằng&nbsp;các&nbsp;phương&nbsp;tiện&nbsp;khác&nbsp;để&nbsp;đi&nbsp;tàu.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;2:&nbsp;sảnh&nbsp;đợi,&nbsp;máy&nbsp;bán&nbsp;vé&nbsp;tự&nbsp;động,&nbsp;máy&nbsp;điều&nbsp;chỉnh&nbsp;giá&nbsp;vé,&nbsp;phòng&nbsp;hướng&nbsp;dẫn&nbsp;thông&nbsp;tin&nbsp;cho&nbsp;hành&nbsp;khách,&nbsp;nhà&nbsp;vệ&nbsp;sinh.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;3:&nbsp;khu&nbsp;vực&nbsp;ke&nbsp;ga,&nbsp;nơi&nbsp;tàu&nbsp;dừng,&nbsp;đỗ&nbsp;để&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách.&nbsp;Kết&nbsp;nối:&nbsp;Hành&nbsp;khách&nbsp;có&nbsp;thể&nbsp;sử&nbsp;dụng&nbsp;xe&nbsp;buýt&nbsp;công&nbsp;cộng&nbsp;để&nbsp;kết&nbsp;nối&nbsp;với&nbsp;nhà&nbsp;ga&nbsp;Phước&nbsp;Long,&nbsp;cụ&nbsp;thể:&nbsp;Tuyến&nbsp;xe&nbsp;buýt&nbsp;số&nbsp;56,&nbsp;150,&nbsp;67,&nbsp;60-3,&nbsp;60-7,&nbsp;162,&nbsp;163,&nbsp;168,&nbsp;169</span></li></ul>', 9, '497e3217-c1cf-4f8d-bb22-9e6ca22dee93');
INSERT INTO public.stations (id, created_at, updated_at, deleted_at, name, code, content, display_order, schedule_image_id) VALUES ('bb7520e4-45c5-46fb-940c-1f0e6be91da2', '2026-06-16 16:14:21.549374', '2026-07-10 15:27:11.980786', NULL, 'Ga Đại học Quốc Gia', 'S13', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Vị&nbsp;trí:&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Ga&nbsp;Đại&nbsp;học&nbsp;Quốc&nbsp;Gia</strong><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">&nbsp;là&nbsp;nhà&nbsp;ga&nbsp;loại&nbsp;A,&nbsp;một&nbsp;trong&nbsp;những&nbsp;nhà&nbsp;ga&nbsp;tàu&nbsp;điện&nbsp;của&nbsp;Tuyến&nbsp;Metro&nbsp;số&nbsp;1,&nbsp;nằm&nbsp;đối&nbsp;diện&nbsp;Khu&nbsp;du&nbsp;lịch&nbsp;Văn&nbsp;hóa&nbsp;Suối&nbsp;Tiên,&nbsp;thuộc&nbsp;địa&nbsp;bàn&nbsp;phường&nbsp;Linh&nbsp;Trung,&nbsp;thành&nbsp;phố&nbsp;Thủ&nbsp;Đức,&nbsp;TP.HCM.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Kết&nbsp;cấu:&nbsp;Bao&nbsp;gồm&nbsp;3&nbsp;tầng&nbsp;:</span></p><ul><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;trệt:&nbsp;khu&nbsp;vực&nbsp;bãi&nbsp;đậu&nbsp;xe&nbsp;và&nbsp;khu&nbsp;vực&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách&nbsp;di&nbsp;chuyển&nbsp;bằng&nbsp;các&nbsp;phương&nbsp;tiện&nbsp;khác&nbsp;để&nbsp;đi&nbsp;tàu.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;2:&nbsp;sảnh&nbsp;đợi,&nbsp;máy&nbsp;bán&nbsp;vé&nbsp;tự&nbsp;động,&nbsp;máy&nbsp;điều&nbsp;chỉnh&nbsp;giá&nbsp;vé,&nbsp;phòng&nbsp;hướng&nbsp;dẫn&nbsp;thông&nbsp;tin&nbsp;cho&nbsp;hành&nbsp;khách,&nbsp;nhà&nbsp;vệ&nbsp;sinh.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;3:&nbsp;khu&nbsp;vực&nbsp;ke&nbsp;ga,&nbsp;nơi&nbsp;tàu&nbsp;dừng,&nbsp;đỗ&nbsp;để&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách.&nbsp;*Tầng&nbsp;2&nbsp;được&nbsp;kết&nbsp;nối&nbsp;với&nbsp;cầu&nbsp;bộ&nbsp;hành&nbsp;băng&nbsp;qua&nbsp;đường&nbsp;Võ&nbsp;Nguyên&nbsp;Giáp&nbsp;trước&nbsp;Khu&nbsp;du&nbsp;lịch&nbsp;văn&nbsp;hóa&nbsp;Suối&nbsp;Tiên</span></li></ul>', 13, '24402595-52ca-48ba-a2d7-cf126f0ed09a');
INSERT INTO public.stations (id, created_at, updated_at, deleted_at, name, code, content, display_order, schedule_image_id) VALUES ('c2878ccf-8f4f-4eb4-bcb4-2a25d78240a3', '2026-06-16 16:14:21.549374', '2026-07-10 15:27:21.472516', NULL, 'Ga Bến xe Suối Tiên', 'S14', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Vị&nbsp;trí:&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Ga&nbsp;Bến&nbsp;xe&nbsp;Suối&nbsp;Tiên</strong><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">&nbsp;là&nbsp;nhà&nbsp;ga&nbsp;loại&nbsp;D,&nbsp;là&nbsp;nhà&nbsp;ga&nbsp;cuối&nbsp;cùng&nbsp;của&nbsp;Tuyến&nbsp;Metro&nbsp;số&nbsp;1,&nbsp;nằm&nbsp;ngay&nbsp;Bến&nbsp;xe&nbsp;Miền&nbsp;Đông&nbsp;mới,&nbsp;phường&nbsp;Bình&nbsp;Thắng,&nbsp;thành&nbsp;phố&nbsp;Dĩ&nbsp;An,&nbsp;tỉnh&nbsp;Bình&nbsp;Dương.&nbsp;Khoảng&nbsp;5&nbsp;–&nbsp;15&nbsp;phút&nbsp;đi&nbsp;bộ&nbsp;từ&nbsp;Ga&nbsp;Suối&nbsp;Tiên&nbsp;là&nbsp;Bến&nbsp;xe&nbsp;Miền&nbsp;Đông&nbsp;mới,&nbsp;Bệnh&nbsp;viện&nbsp;Ung&nbsp;Bướu&nbsp;TP.&nbsp;HCM&nbsp;–&nbsp;Cơ&nbsp;sở&nbsp;2,&nbsp;Khu&nbsp;Ký&nbsp;túc&nbsp;xá&nbsp;Đại&nbsp;học&nbsp;Quốc&nbsp;Gia.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Kết&nbsp;cấu:&nbsp;Bao&nbsp;gồm&nbsp;2&nbsp;tầng&nbsp;:</span></p><ul><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;trệt:&nbsp;sảnh&nbsp;đợi,&nbsp;máy&nbsp;bán&nbsp;vé&nbsp;tự&nbsp;động,&nbsp;máy&nbsp;điều&nbsp;chỉnh&nbsp;giá&nbsp;vé,&nbsp;phòng&nbsp;hướng&nbsp;dẫn&nbsp;thông&nbsp;tin&nbsp;cho&nbsp;hành&nbsp;khách,&nbsp;nhà&nbsp;vệ&nbsp;sinh.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;2:&nbsp;khu&nbsp;vực&nbsp;ke&nbsp;ga,&nbsp;nơi&nbsp;tàu&nbsp;dừng,&nbsp;đỗ&nbsp;để&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách.&nbsp;•&nbsp;Kết&nbsp;nối:&nbsp;Hành&nbsp;khách&nbsp;có&nbsp;thể&nbsp;sử&nbsp;dụng&nbsp;xe&nbsp;buýt&nbsp;công&nbsp;cộng&nbsp;để&nbsp;kết&nbsp;nối&nbsp;với&nbsp;nhà&nbsp;ga&nbsp;Bến&nbsp;xe&nbsp;Suối&nbsp;Tiên,&nbsp;cụ&nbsp;thể:&nbsp;55,&nbsp;56,&nbsp;76,&nbsp;93,&nbsp;150,&nbsp;67,&nbsp;60-1,&nbsp;60-2,&nbsp;60-3</span></li></ul>', 14, '2f0d84ff-9dd4-411c-897c-c6628e93b6aa');
INSERT INTO public.stations (id, created_at, updated_at, deleted_at, name, code, content, display_order, schedule_image_id) VALUES ('ffb18204-ae4f-472a-a21f-9acd96dcf7f2', '2026-06-16 16:14:21.549374', '2026-07-09 16:42:35.737065', NULL, 'Ga Nhà hát Thành phố', 'S02', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Vị&nbsp;trí:&nbsp;Ga&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Nhà&nbsp;hát&nbsp;Thành&nbsp;phố</strong><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">&nbsp;là&nbsp;một&nbsp;trong&nbsp;những&nbsp;nhà&nbsp;ga&nbsp;ngầm&nbsp;của&nbsp;Tuyến&nbsp;Metro&nbsp;số&nbsp;1,&nbsp;nằm&nbsp;trên&nbsp;đường&nbsp;Lê&nbsp;Lợi,&nbsp;Quận&nbsp;1,&nbsp;TP.HCM.&nbsp;Đây&nbsp;là&nbsp;nhà&nbsp;ga&nbsp;ngầm&nbsp;độc&nbsp;đáo,&nbsp;lấy&nbsp;cảm&nbsp;hứng&nbsp;thiết&nbsp;kế&nbsp;từ&nbsp;Nhà&nbsp;hát&nbsp;Thành&nbsp;phố&nbsp;với&nbsp;lối&nbsp;kiến&nbsp;trúc&nbsp;hiện&nbsp;đại,&nbsp;sang&nbsp;trọng&nbsp;và&nbsp;được&nbsp;thi&nbsp;công&nbsp;theo&nbsp;phương&nbsp;pháp&nbsp;đào&nbsp;hở&nbsp;từ&nbsp;trên&nbsp;xuống.&nbsp;Kết&nbsp;cấu:&nbsp;Bao&nbsp;gồm&nbsp;4&nbsp;tầng&nbsp;hầm,&nbsp;hiện&nbsp;đã&nbsp;hoàn&nbsp;thiện&nbsp;và&nbsp;đưa&nbsp;vào&nbsp;sử&nbsp;dụng&nbsp;các&nbsp;tầng:</span></p><ul><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;hầm&nbsp;B1:&nbsp;sảnh&nbsp;đợi,&nbsp;máy&nbsp;bán&nbsp;vé&nbsp;tự&nbsp;động,&nbsp;máy&nbsp;điều&nbsp;chỉnh&nbsp;giá&nbsp;vé,&nbsp;phòng&nbsp;hướng&nbsp;dẫn&nbsp;thông&nbsp;tin&nbsp;cho&nbsp;hành&nbsp;khách,&nbsp;nhà&nbsp;vệ&nbsp;sinh</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;hầm&nbsp;B2:&nbsp;khu&nbsp;vực&nbsp;ke&nbsp;ga,&nbsp;nơi&nbsp;tàu&nbsp;dừng,&nbsp;đỗ&nbsp;để&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;hầm&nbsp;B3:&nbsp;khu&nbsp;vực&nbsp;kỹ&nbsp;thuật,&nbsp;nội&nbsp;bộ&nbsp;không&nbsp;dùng&nbsp;cho&nbsp;hành&nbsp;khách</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;hầm&nbsp;B4:&nbsp;khu&nbsp;vực&nbsp;ke&nbsp;ga,&nbsp;nơi&nbsp;tàu&nbsp;dừng,&nbsp;đỗ&nbsp;để&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách</span></li></ul><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Có&nbsp;5&nbsp;lối&nbsp;lên&nbsp;xuống&nbsp;hành&nbsp;khách&nbsp;có&nbsp;thể&nbsp;sử&nbsp;dụng&nbsp;như&nbsp;sau:</span></p><ul><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Lối&nbsp;số&nbsp;1,&nbsp;số&nbsp;2&nbsp;và&nbsp;số&nbsp;3&nbsp;giáp&nbsp;mặt&nbsp;đường&nbsp;Pasteur.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Lối&nbsp;số&nbsp;4&nbsp;đối&nbsp;diện&nbsp;được&nbsp;nối&nbsp;trực&nbsp;tiếp&nbsp;vào&nbsp;tầng&nbsp;Hầm&nbsp;của&nbsp;Union&nbsp;Square&nbsp;Tower.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Lối&nbsp;số&nbsp;5&nbsp;tại&nbsp;Công&nbsp;Viên&nbsp;Lam&nbsp;Sơn&nbsp;trước&nbsp;Nhà&nbsp;hát&nbsp;Thành&nbsp;phố.&nbsp;Kết&nbsp;nối:&nbsp;Hành&nbsp;khách&nbsp;có&nbsp;thể&nbsp;sử&nbsp;dụng&nbsp;xe&nbsp;buýt&nbsp;công&nbsp;cộng&nbsp;để&nbsp;kết&nbsp;nối&nbsp;với&nbsp;nhà&nbsp;ga&nbsp;Nhà&nbsp;hát&nbsp;Thành&nbsp;phố,&nbsp;cụ&nbsp;thể:</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tuyến&nbsp;xe&nbsp;buýt&nbsp;số&nbsp;155.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tại&nbsp;trạm&nbsp;Lê&nbsp;Lợi&nbsp;(cách&nbsp;ga&nbsp;Nhà&nbsp;hát&nbsp;Thành&nbsp;phố&nbsp;100m),&nbsp;có&nbsp;các&nbsp;tuyến&nbsp;xe&nbsp;buýt:&nbsp;DL01,&nbsp;DL02.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tại&nbsp;trạm&nbsp;Nhà&nbsp;hát&nbsp;Thành&nbsp;phố&nbsp;(cách&nbsp;ga&nbsp;Nhà&nbsp;hát&nbsp;Thành&nbsp;phố&nbsp;180m),&nbsp;có&nbsp;tuyến&nbsp;xe&nbsp;buýt&nbsp;DL02.</span></li></ul>', 2, '3ea8f30d-4f71-47e0-87fc-b1d098ee9e4f');
INSERT INTO public.stations (id, created_at, updated_at, deleted_at, name, code, content, display_order, schedule_image_id) VALUES ('b7c863ce-64c3-4c36-b91a-d3ddbe07cbff', '2026-06-16 16:14:21.549374', '2026-07-09 16:53:01.315581', NULL, 'Ga Bến Thành', 'S01', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Vị&nbsp;trí:&nbsp;Ga&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Bến&nbsp;Thành</strong><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">&nbsp;nằm&nbsp;tại&nbsp;trung&nbsp;tâm&nbsp;TP.HCM,&nbsp;kết&nbsp;nối&nbsp;với&nbsp;Chợ&nbsp;Bến&nbsp;Thành&nbsp;và&nbsp;Công&nbsp;viên&nbsp;23/9,&nbsp;là&nbsp;ga&nbsp;ngầm&nbsp;lớn&nbsp;nhất&nbsp;của&nbsp;tuyến&nbsp;Metro&nbsp;số&nbsp;1.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Kết&nbsp;cấu:&nbsp;Bao&nbsp;gồm&nbsp;4&nbsp;tầng&nbsp;hầm,&nbsp;hiện&nbsp;đã&nbsp;hoàn&nbsp;thiện&nbsp;và&nbsp;đưa&nbsp;vào&nbsp;sử&nbsp;dụng&nbsp;các&nbsp;tầng:</span></p><ul><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;hầm&nbsp;B1:&nbsp;sảnh&nbsp;đợi,&nbsp;máy&nbsp;bán&nbsp;vé&nbsp;tự&nbsp;động,&nbsp;máy&nbsp;điều&nbsp;chỉnh&nbsp;giá&nbsp;vé,&nbsp;phòng&nbsp;hướng&nbsp;dẫn&nbsp;thông&nbsp;tin&nbsp;cho&nbsp;hành&nbsp;khách,&nbsp;nhà&nbsp;vệ&nbsp;sinh</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;hầm&nbsp;B2:&nbsp;khu&nbsp;vực&nbsp;ke&nbsp;ga,&nbsp;nơi&nbsp;tàu&nbsp;dừng,&nbsp;đỗ&nbsp;để&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;hầm&nbsp;B3&nbsp;và&nbsp;B4:&nbsp;phục&nbsp;vụ&nbsp;cho&nbsp;tuyến&nbsp;số&nbsp;2&nbsp;và&nbsp;tuyến&nbsp;số&nbsp;4.&nbsp;Có&nbsp;6&nbsp;lối&nbsp;lên&nbsp;xuống&nbsp;hành&nbsp;khách&nbsp;có&nbsp;thể&nbsp;sử&nbsp;dụng&nbsp;như&nbsp;sau:</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Lối&nbsp;số&nbsp;1&nbsp;và&nbsp;số&nbsp;2&nbsp;đi&nbsp;lên&nbsp;khu&nbsp;vực&nbsp;Công&nbsp;Viên&nbsp;23/9&nbsp;–&nbsp;Công&nbsp;trường&nbsp;Quách&nbsp;Thị&nbsp;Trang.&nbsp;Trong&nbsp;đó&nbsp;lối&nbsp;số&nbsp;1&nbsp;được&nbsp;trang&nbsp;bị&nbsp;thang&nbsp;máy&nbsp;và&nbsp;thang&nbsp;cuốn.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Lối&nbsp;số&nbsp;3&nbsp;tại&nbsp;Đường&nbsp;Phan&nbsp;Chu&nbsp;Trinh,&nbsp;bên&nbsp;cạnh&nbsp;chợ&nbsp;Bến&nbsp;Thành.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Lối&nbsp;số&nbsp;4&nbsp;và&nbsp;số&nbsp;5&nbsp;được&nbsp;nối&nbsp;trực&nbsp;tiếp&nbsp;vào&nbsp;tầng&nbsp;Hầm&nbsp;của&nbsp;Dự&nbsp;án&nbsp;Khu&nbsp;tứ&nbsp;giác&nbsp;Bến&nbsp;Thành.&nbsp;Hiện&nbsp;chỉ&nbsp;được&nbsp;sử&nbsp;dụng&nbsp;để&nbsp;thoát&nbsp;hiểm&nbsp;trong&nbsp;trường&nbsp;hợp&nbsp;khẩn&nbsp;cấp.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Lối&nbsp;số&nbsp;6&nbsp;đi&nbsp;lên&nbsp;giao&nbsp;lộ&nbsp;Lê&nbsp;Lai&nbsp;–&nbsp;Huỳnh&nbsp;Thúc&nbsp;Kháng&nbsp;–&nbsp;Hàm&nbsp;Nghi,&nbsp;phía&nbsp;trước&nbsp;toà&nbsp;nhà&nbsp;Công&nbsp;ty&nbsp;vận&nbsp;tải&nbsp;Đường&nbsp;sắt,&nbsp;Bệnh&nbsp;viện&nbsp;Đa&nbsp;khoa&nbsp;Sài&nbsp;Gòn.&nbsp;Kết&nbsp;nối:&nbsp;Hành&nbsp;khách&nbsp;có&nbsp;thể&nbsp;sử&nbsp;dụng&nbsp;xe&nbsp;buýt&nbsp;công&nbsp;cộng&nbsp;để&nbsp;kết&nbsp;nối&nbsp;với&nbsp;nhà&nbsp;ga&nbsp;Bến&nbsp;Thành,&nbsp;cụ&nbsp;thể:</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tuyến&nbsp;M21:&nbsp;Bến&nbsp;xe&nbsp;buýt&nbsp;Sài&nbsp;Gòn&nbsp;-&nbsp;Nhà&nbsp;hát&nbsp;Thành&nbsp;phố</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tuyến&nbsp;M22:&nbsp;Bến&nbsp;xe&nbsp;buýt&nbsp;Sài&nbsp;Gòn&nbsp;-&nbsp;Ga&nbsp;Hòa&nbsp;Hưng</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tuyến&nbsp;11:&nbsp;Đầm&nbsp;Sen&nbsp;-&nbsp;Bến&nbsp;Thành&nbsp;-&nbsp;Thảo&nbsp;Điền</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tuyến&nbsp;1:&nbsp;Bến&nbsp;Thành&nbsp;-&nbsp;Bến&nbsp;xe&nbsp;buýt&nbsp;Chợ&nbsp;Lớn</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tuyến&nbsp;31:&nbsp;Đại&nbsp;học&nbsp;Tôn&nbsp;Đức&nbsp;Thắng&nbsp;-&nbsp;Bến&nbsp;Thành&nbsp;-&nbsp;Đại&nbsp;học&nbsp;Văn&nbsp;Lang</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tuyến&nbsp;45:&nbsp;Đại&nbsp;học&nbsp;Kinh&nbsp;tế&nbsp;-&nbsp;Bến&nbsp;Thành&nbsp;-&nbsp;Bến&nbsp;xe&nbsp;Miền&nbsp;Đông</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tuyến&nbsp;53:&nbsp;Lê&nbsp;Hồng&nbsp;Phong&nbsp;-&nbsp;Đại&nbsp;học&nbsp;Quốc&nbsp;Gia</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tuyến&nbsp;56:&nbsp;Bến&nbsp;xe&nbsp;buýt&nbsp;Chợ&nbsp;Lớn&nbsp;-&nbsp;Bến&nbsp;xe&nbsp;Miền&nbsp;Đông</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tuyến&nbsp;152:&nbsp;KDC&nbsp;Trung&nbsp;Sơn&nbsp;-&nbsp;Bến&nbsp;Thành&nbsp;-&nbsp;Sân&nbsp;bay&nbsp;Tân&nbsp;Sơn&nbsp;Nhất</span></li></ul>', 1, '79e05d8a-e12d-48db-9b1a-75702e04edaf');
INSERT INTO public.stations (id, created_at, updated_at, deleted_at, name, code, content, display_order, schedule_image_id) VALUES ('78b397f7-3fb3-4a34-8cad-07273b255c8c', '2026-06-16 16:14:21.549374', '2026-07-10 15:26:41.41759', NULL, 'Ga Thủ Đức', 'S11', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Vị&nbsp;trí:&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Ga&nbsp;Thủ&nbsp;Đức</strong><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">&nbsp;là&nbsp;nhà&nbsp;ga&nbsp;loại&nbsp;A,&nbsp;nằm&nbsp;tại&nbsp;phường&nbsp;Bình&nbsp;Thọ,&nbsp;thành&nbsp;phố&nbsp;Thủ&nbsp;Đức,&nbsp;TP.HCM&nbsp;cách&nbsp;trường&nbsp;Đại&nbsp;học&nbsp;Sư&nbsp;phạm&nbsp;Kỹ&nbsp;thuật&nbsp;TP.HCM&nbsp;600m&nbsp;(10&nbsp;phút&nbsp;đi&nbsp;bộ).</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Kết&nbsp;cấu:&nbsp;Bao&nbsp;gồm&nbsp;3&nbsp;tầng&nbsp;:</span></p><ul><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;trệt:&nbsp;khu&nbsp;vực&nbsp;bãi&nbsp;đậu&nbsp;xe&nbsp;và&nbsp;khu&nbsp;vực&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách&nbsp;di&nbsp;chuyển&nbsp;bằng&nbsp;các&nbsp;phương&nbsp;tiện&nbsp;khác&nbsp;để&nbsp;đi&nbsp;tàu.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;2:&nbsp;sảnh&nbsp;đợi,&nbsp;máy&nbsp;bán&nbsp;vé&nbsp;tự&nbsp;động,&nbsp;máy&nbsp;điều&nbsp;chỉnh&nbsp;giá&nbsp;vé,&nbsp;phòng&nbsp;hướng&nbsp;dẫn&nbsp;thông&nbsp;tin&nbsp;cho&nbsp;hành&nbsp;khách,&nbsp;nhà&nbsp;vệ&nbsp;sinh.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;3:&nbsp;khu&nbsp;vực&nbsp;ke&nbsp;ga,&nbsp;nơi&nbsp;tàu&nbsp;dừng,&nbsp;đỗ&nbsp;để&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách.&nbsp;Kết&nbsp;nối:&nbsp;Hành&nbsp;khách&nbsp;có&nbsp;thể&nbsp;sử&nbsp;dụng&nbsp;xe&nbsp;buýt&nbsp;công&nbsp;cộng&nbsp;để&nbsp;kết&nbsp;nối&nbsp;với&nbsp;nhà&nbsp;ga&nbsp;Thủ&nbsp;Đức,&nbsp;cụ&nbsp;thể:&nbsp;10,&nbsp;30,&nbsp;52,&nbsp;53,&nbsp;55,&nbsp;104,&nbsp;150,&nbsp;67,&nbsp;60-3,&nbsp;60-7,&nbsp;162,&nbsp;168,&nbsp;M7,&nbsp;M8.&nbsp;•&nbsp;Tại&nbsp;trạm&nbsp;Ga&nbsp;metro&nbsp;Thủ&nbsp;Đức&nbsp;(cách&nbsp;ga&nbsp;Thủ&nbsp;Đức&nbsp;25m),&nbsp;có&nbsp;các&nbsp;tuyến&nbsp;xe&nbsp;buýt:&nbsp;10,&nbsp;104,&nbsp;150,&nbsp;30,&nbsp;52,&nbsp;55,&nbsp;60-3,&nbsp;60-7,&nbsp;67.&nbsp;•&nbsp;Tại&nbsp;trạm&nbsp;ngã&nbsp;tư&nbsp;Thủ&nbsp;Đức&nbsp;(cách&nbsp;ga&nbsp;Thủ&nbsp;Đức&nbsp;280m),&nbsp;có&nbsp;các&nbsp;tuyến&nbsp;xe&nbsp;buýt:&nbsp;10,&nbsp;104,&nbsp;150,&nbsp;30,&nbsp;52,&nbsp;55,&nbsp;60-3,&nbsp;60-7,&nbsp;67.</span></li></ul>', 11, '5b21048c-4e1f-4357-b09d-dac9b08fdd87');
INSERT INTO public.stations (id, created_at, updated_at, deleted_at, name, code, content, display_order, schedule_image_id) VALUES ('285b55ea-8b3f-49bd-96f5-7b52e00231b7', '2026-06-16 16:14:21.549374', '2026-07-10 15:26:55.507088', NULL, 'Ga Khu Công nghệ cao', 'S12', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Vị&nbsp;trí:&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Ga&nbsp;Khu&nbsp;Công&nbsp;nghệ&nbsp;cao</strong><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">&nbsp;là&nbsp;nhà&nbsp;ga&nbsp;loại&nbsp;A,&nbsp;nằm&nbsp;đối&nbsp;diện&nbsp;Khu&nbsp;công&nbsp;nghệ&nbsp;cao&nbsp;TP.HCM,&nbsp;thuộc&nbsp;địa&nbsp;bàn&nbsp;phường&nbsp;Linh&nbsp;Trung,&nbsp;thành&nbsp;phố&nbsp;Thủ&nbsp;Đức,&nbsp;TP.HCM&nbsp;dự&nbsp;kiến&nbsp;sự&nbsp;thu&nbsp;hút&nbsp;lưu&nbsp;lượng&nbsp;lớn&nbsp;hành&nbsp;khách&nbsp;sử&nbsp;dụng&nbsp;là&nbsp;để&nbsp;đi&nbsp;làm&nbsp;việc,&nbsp;học&nbsp;tập&nbsp;tại&nbsp;đây.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Kết&nbsp;cấu:&nbsp;Bao&nbsp;gồm&nbsp;3&nbsp;tầng&nbsp;:</span></p><ul><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;trệt:&nbsp;khu&nbsp;vực&nbsp;bãi&nbsp;đậu&nbsp;xe&nbsp;và&nbsp;khu&nbsp;vực&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách&nbsp;di&nbsp;chuyển&nbsp;bằng&nbsp;các&nbsp;phương&nbsp;tiện&nbsp;khác&nbsp;để&nbsp;đi&nbsp;tàu.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;2:&nbsp;sảnh&nbsp;đợi,&nbsp;máy&nbsp;bán&nbsp;vé&nbsp;tự&nbsp;động,&nbsp;máy&nbsp;điều&nbsp;chỉnh&nbsp;giá&nbsp;vé,&nbsp;phòng&nbsp;hướng&nbsp;dẫn&nbsp;thông&nbsp;tin&nbsp;cho&nbsp;hành&nbsp;khách,&nbsp;nhà&nbsp;vệ&nbsp;sinh.</span></li><li><span style="background-color: rgb(255, 255, 255); color: rgb(0, 0, 0);">Tầng&nbsp;3:&nbsp;khu&nbsp;vực&nbsp;ke&nbsp;ga,&nbsp;nơi&nbsp;tàu&nbsp;dừng,&nbsp;đỗ&nbsp;để&nbsp;đón&nbsp;và&nbsp;trả&nbsp;khách.&nbsp;Kết&nbsp;nối:&nbsp;Hành&nbsp;khách&nbsp;có&nbsp;thể&nbsp;sử&nbsp;dụng&nbsp;xe&nbsp;buýt&nbsp;công&nbsp;cộng&nbsp;để&nbsp;kết&nbsp;nối&nbsp;với&nbsp;nhà&nbsp;ga&nbsp;Khu&nbsp;công&nbsp;nghệ&nbsp;cao,&nbsp;cụ&nbsp;thể:&nbsp;06,&nbsp;08,&nbsp;10,&nbsp;30,&nbsp;52,&nbsp;76,&nbsp;150,&nbsp;67,&nbsp;60-3,&nbsp;60-7,&nbsp;164,&nbsp;165,&nbsp;167,&nbsp;M6,&nbsp;M10,&nbsp;M20.&nbsp;•&nbsp;Tại&nbsp;trạm&nbsp;Xa&nbsp;lộ&nbsp;Hà&nbsp;Nội&nbsp;(ngay&nbsp;ga&nbsp;Khu&nbsp;công&nbsp;nghệ&nbsp;cao),&nbsp;có&nbsp;các&nbsp;tuyến&nbsp;xe&nbsp;buýt:&nbsp;06,&nbsp;08,&nbsp;10,&nbsp;30,&nbsp;52,&nbsp;60-3,&nbsp;60-7,&nbsp;67,&nbsp;76,&nbsp;150</span></li></ul>', 12, 'f53ede0a-d3bd-405c-b2ff-d8bdba8570f0');


--
-- TOC entry 5118 (class 0 OID 17930)
-- Dependencies: 228
-- Data for Name: ticket_fares; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.ticket_fares (id, created_at, updated_at, deleted_at, title, display_order, is_active, image_id) VALUES ('3d460b4c-5c63-4329-86af-a6b72f61041f', '2026-06-20 16:01:02.063401', '2026-07-10 15:35:04.680217', NULL, 'Bảng giá vé hiện hành', 1, true, 'd277d837-a6e0-497f-afbf-df3d8b7c9762');


--
-- TOC entry 5113 (class 0 OID 17749)
-- Dependencies: 223
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users (id, created_at, updated_at, deleted_at, email, password, full_name, role, is_active) VALUES ('7e7c93bd-b455-4044-946e-7c7dfe1e328d', '2026-06-16 16:13:26.637015', '2026-07-09 10:47:01.118661', NULL, 'admin@hurc.vn', '$2b$10$itROYCYxUAiZqHCnyQqaeuS4V3IBhIoW8DVgwaygWwHvGTKgAuibm', 'Super Admin', 'ADMIN', true);


--
-- TOC entry 4921 (class 2606 OID 17704)
-- Name: articles PK_0a6e2c450d83e0b6052c2793334; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334" PRIMARY KEY (id);


--
-- TOC entry 4953 (class 2606 OID 17975)
-- Name: audit_logs PK_1bb179d048bbc581caa3b013439; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY (id);


--
-- TOC entry 4951 (class 2606 OID 17947)
-- Name: ticket_fares PK_6041755064d492c2dc1af69f43a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_fares
    ADD CONSTRAINT "PK_6041755064d492c2dc1af69f43a" PRIMARY KEY (id);


--
-- TOC entry 4940 (class 2606 OID 17902)
-- Name: blacklisted_tokens PK_8fb1bc7333c3b9f249f9feaa55d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blacklisted_tokens
    ADD CONSTRAINT "PK_8fb1bc7333c3b9f249f9feaa55d" PRIMARY KEY (id);


--
-- TOC entry 4930 (class 2606 OID 17768)
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- TOC entry 4938 (class 2606 OID 17854)
-- Name: contacts PK_b99cd40cfd66a99f1571f4f72e6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT "PK_b99cd40cfd66a99f1571f4f72e6" PRIMARY KEY (id);


--
-- TOC entry 4934 (class 2606 OID 17822)
-- Name: jobs PK_cf0a6c42b72fcc7f7c237def345; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT "PK_cf0a6c42b72fcc7f7c237def345" PRIMARY KEY (id);


--
-- TOC entry 4926 (class 2606 OID 17724)
-- Name: banners PK_e9b186b959296fcb940790d31c3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT "PK_e9b186b959296fcb940790d31c3" PRIMARY KEY (id);


--
-- TOC entry 4944 (class 2606 OID 17920)
-- Name: stations PK_f047974bd453c85b08bab349367; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stations
    ADD CONSTRAINT "PK_f047974bd453c85b08bab349367" PRIMARY KEY (id);


--
-- TOC entry 4928 (class 2606 OID 17742)
-- Name: media PK_f4e0fcac36e050de337b670d8bd; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY (id);


--
-- TOC entry 4923 (class 2606 OID 17706)
-- Name: articles UQ_1123ff6815c5b8fec0ba9fec370; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT "UQ_1123ff6815c5b8fec0ba9fec370" UNIQUE (slug);


--
-- TOC entry 4946 (class 2606 OID 17924)
-- Name: stations UQ_4527107221143b0530c23ef1d62; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stations
    ADD CONSTRAINT "UQ_4527107221143b0530c23ef1d62" UNIQUE (code);


--
-- TOC entry 4932 (class 2606 OID 17770)
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- TOC entry 4948 (class 2606 OID 17922)
-- Name: stations UQ_998a2ff0191749951c74b9ba890; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stations
    ADD CONSTRAINT "UQ_998a2ff0191749951c74b9ba890" UNIQUE (name);


--
-- TOC entry 4936 (class 2606 OID 17824)
-- Name: jobs UQ_ebf78eba11615c490d5db84451a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT "UQ_ebf78eba11615c490d5db84451a" UNIQUE (slug);


--
-- TOC entry 4918 (class 1259 OID 18051)
-- Name: IDX_1123ff6815c5b8fec0ba9fec37; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_1123ff6815c5b8fec0ba9fec37" ON public.articles USING btree (slug);


--
-- TOC entry 4924 (class 1259 OID 18053)
-- Name: IDX_176f2f70d4be816a04d7195d8c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_176f2f70d4be816a04d7195d8c" ON public.banners USING btree (is_active);


--
-- TOC entry 4919 (class 1259 OID 18052)
-- Name: IDX_5f0a73d2e1cc0db5557ae257d1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_5f0a73d2e1cc0db5557ae257d1" ON public.articles USING btree (status);


--
-- TOC entry 4941 (class 1259 OID 18056)
-- Name: IDX_63f3e234c920545fa7fdb33bb8; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_63f3e234c920545fa7fdb33bb8" ON public.stations USING btree (content);


--
-- TOC entry 4942 (class 1259 OID 18057)
-- Name: IDX_a3495e49555e34b162ef40168a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_a3495e49555e34b162ef40168a" ON public.stations USING btree (schedule_image_id);


--
-- TOC entry 4949 (class 1259 OID 18058)
-- Name: IDX_b490b93541b4c755ffde327061; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_b490b93541b4c755ffde327061" ON public.ticket_fares USING btree (is_active);


--
-- TOC entry 4960 (class 2606 OID 17885)
-- Name: contacts FK_12425985b94025f4fe97f14ae9c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT "FK_12425985b94025f4fe97f14ae9c" FOREIGN KEY (resolved_by) REFERENCES public.users(id);


--
-- TOC entry 4954 (class 2606 OID 17984)
-- Name: articles FK_1c6a62f5496d6f9e5646230ef3c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT "FK_1c6a62f5496d6f9e5646230ef3c" FOREIGN KEY (thumbnail_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- TOC entry 4959 (class 2606 OID 17880)
-- Name: jobs FK_2d210533bd8823b36702a26dd43; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT "FK_2d210533bd8823b36702a26dd43" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 4956 (class 2606 OID 17870)
-- Name: banners FK_6030fcd59bf52e2bb0983e3be38; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT "FK_6030fcd59bf52e2bb0983e3be38" FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 4955 (class 2606 OID 17860)
-- Name: articles FK_6515da4dff8db423ce4eb841490; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT "FK_6515da4dff8db423ce4eb841490" FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- TOC entry 4958 (class 2606 OID 17875)
-- Name: media FK_8468de6d91985f53a1a3324741c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT "FK_8468de6d91985f53a1a3324741c" FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- TOC entry 4962 (class 2606 OID 17994)
-- Name: ticket_fares FK_94e2cfd2b57bca32eaafdf0e66c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_fares
    ADD CONSTRAINT "FK_94e2cfd2b57bca32eaafdf0e66c" FOREIGN KEY (image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- TOC entry 4957 (class 2606 OID 17989)
-- Name: banners FK_992a25a81b7c212d749a31832f8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT "FK_992a25a81b7c212d749a31832f8" FOREIGN KEY (image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- TOC entry 4961 (class 2606 OID 17979)
-- Name: stations FK_a3495e49555e34b162ef40168a7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stations
    ADD CONSTRAINT "FK_a3495e49555e34b162ef40168a7" FOREIGN KEY (schedule_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


-- Completed on 2026-07-14 11:03:48

--
-- PostgreSQL database dump complete
--

\unrestrict lFwT3jLTHdjHdJa03ceBgu21yZjrlV3Sbqtgijkt0T5fS7SDaDs9JpS0vDMRHAY

