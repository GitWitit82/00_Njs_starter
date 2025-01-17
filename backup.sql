--
-- PostgreSQL database dump
--

-- Dumped from database version 14.15 (Homebrew)
-- Dumped by pg_dump version 14.15 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ChangeType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ChangeType" AS ENUM (
    'CREATED',
    'UPDATED',
    'SUBMITTED',
    'REVIEWED',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."ChangeType" OWNER TO postgres;

--
-- Name: FormFieldType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FormFieldType" AS ENUM (
    'TEXT',
    'TEXTAREA',
    'NUMBER',
    'CHECKBOX',
    'RADIO',
    'SELECT',
    'DATE',
    'TIME',
    'DATETIME',
    'CUSTOM'
);


ALTER TYPE public."FormFieldType" OWNER TO postgres;

--
-- Name: FormInstanceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FormInstanceStatus" AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'ARCHIVED',
    'IN_PROGRESS',
    'PENDING_REVIEW',
    'ON_HOLD'
);


ALTER TYPE public."FormInstanceStatus" OWNER TO postgres;

--
-- Name: FormPriority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FormPriority" AS ENUM (
    'CRITICAL',
    'STANDARD',
    'OPTIONAL'
);


ALTER TYPE public."FormPriority" OWNER TO postgres;

--
-- Name: FormStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FormStatus" AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'IN_REVIEW',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."FormStatus" OWNER TO postgres;

--
-- Name: FormType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FormType" AS ENUM (
    'FORM',
    'CHECKLIST',
    'SURVEY',
    'INSPECTION'
);


ALTER TYPE public."FormType" OWNER TO postgres;

--
-- Name: PhaseStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PhaseStatus" AS ENUM (
    'NOT_STARTED',
    'IN_PROGRESS',
    'COMPLETED',
    'ON_HOLD'
);


ALTER TYPE public."PhaseStatus" OWNER TO postgres;

--
-- Name: Priority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Priority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH'
);


ALTER TYPE public."Priority" OWNER TO postgres;

--
-- Name: ProjectStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ProjectStatus" AS ENUM (
    'PLANNING',
    'IN_PROGRESS',
    'ON_HOLD',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."ProjectStatus" OWNER TO postgres;

--
-- Name: ProjectType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ProjectType" AS ENUM (
    'VEHICLE_WRAP',
    'SIGN',
    'MURAL'
);


ALTER TYPE public."ProjectType" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'MANAGER',
    'USER'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: TaskStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TaskStatus" AS ENUM (
    'NOT_STARTED',
    'IN_PROGRESS',
    'ON_HOLD',
    'COMPLETED'
);


ALTER TYPE public."TaskStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO postgres;

--
-- Name: Department; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Department" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    color text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Department" OWNER TO postgres;

--
-- Name: FormCompletionRequirement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FormCompletionRequirement" (
    id text NOT NULL,
    "templateId" text NOT NULL,
    "phaseId" text NOT NULL,
    "isRequired" boolean DEFAULT true NOT NULL,
    "requiredForPhase" boolean DEFAULT false NOT NULL,
    "requiredForTask" boolean DEFAULT true NOT NULL,
    "completionOrder" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FormCompletionRequirement" OWNER TO postgres;

--
-- Name: FormInstance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FormInstance" (
    id text NOT NULL,
    "templateId" text NOT NULL,
    "versionId" text NOT NULL,
    "projectId" text NOT NULL,
    "projectTaskId" text NOT NULL,
    status public."FormInstanceStatus" DEFAULT 'ACTIVE'::public."FormInstanceStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FormInstance" OWNER TO postgres;

--
-- Name: FormResponse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FormResponse" (
    id text NOT NULL,
    data jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    comments text,
    metadata jsonb,
    "reviewedAt" timestamp(3) without time zone,
    "reviewedById" text,
    "submittedAt" timestamp(3) without time zone,
    "submittedById" text,
    status public."FormStatus" DEFAULT 'DRAFT'::public."FormStatus" NOT NULL,
    "instanceId" text NOT NULL,
    version integer NOT NULL,
    "taskId" text NOT NULL,
    "templateId" text NOT NULL
);


ALTER TABLE public."FormResponse" OWNER TO postgres;

--
-- Name: FormResponseHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FormResponseHistory" (
    id text NOT NULL,
    "responseId" text NOT NULL,
    data jsonb NOT NULL,
    metadata jsonb,
    status public."FormStatus" NOT NULL,
    "changedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedById" text NOT NULL,
    "changeType" public."ChangeType" NOT NULL,
    comments text
);


ALTER TABLE public."FormResponseHistory" OWNER TO postgres;

--
-- Name: FormStatusHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FormStatusHistory" (
    id text NOT NULL,
    "instanceId" text NOT NULL,
    status public."FormInstanceStatus" NOT NULL,
    "changedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedById" text NOT NULL,
    metadata jsonb,
    comments text
);


ALTER TABLE public."FormStatusHistory" OWNER TO postgres;

--
-- Name: FormTemplate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FormTemplate" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    schema jsonb NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "phaseId" text NOT NULL,
    "departmentId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    layout jsonb,
    metadata jsonb,
    style jsonb,
    "currentVersion" integer DEFAULT 1 NOT NULL,
    "workflowId" text NOT NULL,
    priority public."FormPriority" DEFAULT 'STANDARD'::public."FormPriority" NOT NULL
);


ALTER TABLE public."FormTemplate" OWNER TO postgres;

--
-- Name: FormVersion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FormVersion" (
    id text NOT NULL,
    version integer NOT NULL,
    "templateId" text NOT NULL,
    schema jsonb NOT NULL,
    layout jsonb,
    style jsonb,
    metadata jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdById" text NOT NULL,
    changelog text
);


ALTER TABLE public."FormVersion" OWNER TO postgres;

--
-- Name: Phase; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Phase" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "order" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "workflowId" text NOT NULL
);


ALTER TABLE public."Phase" OWNER TO postgres;

--
-- Name: Project; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Project" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    status public."ProjectStatus" DEFAULT 'PLANNING'::public."ProjectStatus" NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "workflowId" text NOT NULL,
    "managerId" text NOT NULL,
    "customerName" text NOT NULL,
    "projectType" public."ProjectType" NOT NULL,
    "vinNumber" text
);


ALTER TABLE public."Project" OWNER TO postgres;

--
-- Name: ProjectPhase; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProjectPhase" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "order" integer NOT NULL,
    status public."PhaseStatus" DEFAULT 'NOT_STARTED'::public."PhaseStatus" NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "projectId" text NOT NULL,
    "phaseId" text NOT NULL
);


ALTER TABLE public."ProjectPhase" OWNER TO postgres;

--
-- Name: ProjectTask; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProjectTask" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "order" integer DEFAULT 0 NOT NULL,
    "departmentId" text,
    "assignedToId" text,
    "workflowTaskId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "projectId" text NOT NULL,
    "phaseId" text NOT NULL,
    status text DEFAULT 'NOT_STARTED'::text NOT NULL,
    priority text DEFAULT 'MEDIUM'::text NOT NULL,
    "actualEnd" timestamp(3) without time zone,
    "actualStart" timestamp(3) without time zone,
    "manHours" double precision DEFAULT 1 NOT NULL,
    "scheduledEnd" timestamp(3) without time zone,
    "scheduledStart" timestamp(3) without time zone
);


ALTER TABLE public."ProjectTask" OWNER TO postgres;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO postgres;

--
-- Name: TaskActivity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TaskActivity" (
    id text NOT NULL,
    "taskId" text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    details text NOT NULL
);


ALTER TABLE public."TaskActivity" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text,
    "emailVerified" timestamp(3) without time zone,
    image text,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "hashedPassword" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: UserPreference; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserPreference" (
    id text NOT NULL,
    "userId" text NOT NULL,
    theme text DEFAULT 'system'::text NOT NULL,
    notifications jsonb DEFAULT '{"push": true, "email": true, "taskUpdated": true, "taskAssigned": true, "taskCompleted": true}'::jsonb NOT NULL,
    dashboard jsonb DEFAULT '{"defaultView": "board", "taskSortOrder": "priority", "showCompletedTasks": false}'::jsonb NOT NULL,
    "taskView" jsonb DEFAULT '{"defaultStatus": "NOT_STARTED", "defaultPriority": "MEDIUM", "showDepartmentColors": true}'::jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserPreference" OWNER TO postgres;

--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationToken" OWNER TO postgres;

--
-- Name: Workflow; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Workflow" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Workflow" OWNER TO postgres;

--
-- Name: WorkflowTask; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WorkflowTask" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    priority public."Priority" DEFAULT 'MEDIUM'::public."Priority" NOT NULL,
    "manHours" double precision DEFAULT 1 NOT NULL,
    "order" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "phaseId" text NOT NULL,
    "departmentId" text
);


ALTER TABLE public."WorkflowTask" OWNER TO postgres;

--
-- Name: _FormDependencies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_FormDependencies" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_FormDependencies" OWNER TO postgres;

--
-- Name: _UserDepartments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_UserDepartments" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_UserDepartments" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: Department; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Department" (id, name, description, color, "createdAt", "updatedAt") FROM stdin;
cm5yedwv600018of5uvovs423	Marketing	Handles creative concepts and marketing strategies	#2563eb	2025-01-15 21:12:15.522	2025-01-15 21:12:15.522
cm5yedwva00038of57rgu7jra	Design	Creates designs and handles artwork production	#9333ea	2025-01-15 21:12:15.522	2025-01-15 21:12:15.522
cm5yedwva00028of5ytsg4ffs	Prep	Prepares surfaces and materials for installation	#ea580c	2025-01-15 21:12:15.522	2025-01-15 21:12:15.522
cm5yedwvb00058of5jxiwy18t	Project Mgmt	Manages project workflow and client communication	#16a34a	2025-01-15 21:12:15.522	2025-01-15 21:12:15.522
cm5yedwvc00068of50409aizp	Production	Handles manufacturing and production processes	#be185d	2025-01-15 21:12:15.522	2025-01-15 21:12:15.522
cm5yedwva00048of5w1cxf0c7	Installation	Performs physical installation of products	#0891b2	2025-01-15 21:12:15.522	2025-01-15 21:12:15.522
cm5yedwvp00078of57sqvuaiv	Finance	Handles invoicing and financial tracking	#ca8a04	2025-01-15 21:12:15.522	2025-01-15 21:12:15.522
cm5yedwvq00088of5z1uv06gm	All Departments	Tasks that require collaboration across departments	#dc2626	2025-01-15 21:12:15.522	2025-01-15 21:12:15.522
\.


--
-- Data for Name: FormCompletionRequirement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FormCompletionRequirement" (id, "templateId", "phaseId", "isRequired", "requiredForPhase", "requiredForTask", "completionOrder", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: FormInstance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FormInstance" (id, "templateId", "versionId", "projectId", "projectTaskId", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: FormResponse; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FormResponse" (id, data, "createdAt", "updatedAt", comments, metadata, "reviewedAt", "reviewedById", "submittedAt", "submittedById", status, "instanceId", version, "taskId", "templateId") FROM stdin;
\.


--
-- Data for Name: FormResponseHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FormResponseHistory" (id, "responseId", data, metadata, status, "changedAt", "changedById", "changeType", comments) FROM stdin;
\.


--
-- Data for Name: FormStatusHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FormStatusHistory" (id, "instanceId", status, "changedAt", "changedById", metadata, comments) FROM stdin;
\.


--
-- Data for Name: FormTemplate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FormTemplate" (id, name, description, schema, "order", "createdAt", "updatedAt", "phaseId", "departmentId", "isActive", layout, metadata, style, "currentVersion", "workflowId", priority) FROM stdin;
cm5yedwwx002z8of5ux5ihyer	PRE-DESIGN LAYOUT MEETING	Checklist for pre-design layout meeting	{"sections": [{"id": "84f4f506-9e48-4dea-ad6d-c8462877b4f7", "type": "CHECKLIST", "title": "PRE-DESIGN LAYOUT MEETING", "fields": [{"id": "6042ad8e-6743-49cb-a047-40c95fed75a4", "type": "checkbox", "label": "Review physical inspection form(s) with all departments", "options": [], "required": true}, {"id": "e4876d42-dfae-4ce1-81e7-7616e5f09fe5", "type": "checkbox", "label": "Review & document wrapable areas", "options": [], "required": true}, {"id": "2535141f-a3f1-4532-8e12-3354e79499bd", "type": "checkbox", "label": "Review & document un-wrapable areas", "options": [], "required": true}, {"id": "92dbc344-14f1-4dd1-a7cf-b1ccac2b0ccf", "type": "checkbox", "label": "General design do & don't review", "options": [], "required": true}, {"id": "b01028fb-318a-410b-aaef-fe6d5d70bfda", "type": "checkbox", "label": "Seams and panel plan reviewed", "options": [], "required": true}]}]}	0	2025-01-15 21:12:15.585	2025-01-15 21:12:15.585	cm5yedwvy000p8of5nykwtj6o	cm5yedwva00038of57rgu7jra	t	{"sections": [{"id": "304a5e75-8b23-41e3-a7d9-168f434f847c", "type": "CHECKLIST", "title": "PRE-DESIGN LAYOUT MEETING", "fields": [{"id": "70bc3d30-145f-48e7-8421-a7329454e1ae", "type": "checkbox", "label": "Review physical inspection form(s) with all departments"}, {"id": "28f6d160-5fe8-43fa-8944-a4e41ba99536", "type": "checkbox", "label": "Review & document wrapable areas"}, {"id": "03801aaf-1ff6-4a52-b275-f11a99830f67", "type": "checkbox", "label": "Review & document un-wrapable areas"}, {"id": "01d4752a-7619-44df-8d31-46bb31db0f6c", "type": "checkbox", "label": "General design do & don't review"}, {"id": "14f36825-7055-4207-9eb8-11417e0cbc4a", "type": "checkbox", "label": "Seams and panel plan reviewed"}]}]}	{"version": 1, "lastUpdated": "2025-01-15T21:12:15.584Z"}	{"theme": "default"}	1	cm5yedwvs00098of5lwopbywk	STANDARD
cm5yedwx500338of5vgg9zttq	VEHICLE MEASUREMENT CHECKLIST	Checklist for vehicle measurement checklist	{"sections": [{"id": "a9c6cf2f-3fc5-479f-a9f9-66274a273b19", "type": "CHECKLIST", "title": "VEHICLE MEASUREMENT CHECKLIST", "fields": [{"id": "9469bbe2-ed15-43df-82bf-bfd8eb6c8f89", "type": "checkbox", "label": "Photographed all sides of vehicle straight on using iPad", "options": [], "required": true}, {"id": "95b04440-b6af-449d-a4d4-80132a245dea", "type": "checkbox", "label": "Photographed VIN Number", "options": [], "required": true}, {"id": "04ac1e82-c855-42cd-b7f6-a09d98b934e3", "type": "checkbox", "label": "Customers name written on first photographed", "options": [], "required": true}, {"id": "05ccd79c-1249-4f47-acd7-1650bccff503", "type": "checkbox", "label": "Measured vehicle from furthest point to furthest point, horizontally and vertically, using different colors for each", "options": [], "required": true}, {"id": "55c359ea-0335-4b8a-93a9-3ac0378cea7c", "type": "checkbox", "label": "Marked measurements of locations of all door seams, indents, door handles, etc", "options": [], "required": true}, {"id": "d9bf5b81-f01e-4519-bfd4-896ea376a5cb", "type": "checkbox", "label": "Made note of any unwrappable areas", "options": [], "required": true}, {"id": "b1fe04fd-3a9d-4858-9906-d4bb7c34fa0a", "type": "checkbox", "label": "Confirmed window coverage and measured accordingly", "options": [], "required": true}, {"id": "ae930a07-7b2c-4005-bf9e-bbf8e31212d8", "type": "checkbox", "label": "Confirmed roof coverage and measured accordingly", "options": [], "required": true}, {"id": "b96097bd-2f51-4814-a375-9e56a7cb94da", "type": "checkbox", "label": "Confirmed bumper coverage and measured accordingly", "options": [], "required": true}, {"id": "76f475aa-ca89-4327-88fa-ee1fa22b04f4", "type": "checkbox", "label": "Confirmed iPad Photos synced with Mac Photos", "options": [], "required": true}, {"id": "6d965706-0812-4e10-889a-94a1bed0f02a", "type": "checkbox", "label": "Moved photos from Mac Photos app into Before Photos folder in Clients folder", "options": [], "required": true}, {"id": "f1a69d74-d19d-4281-aaaf-abd9f3017f36", "type": "checkbox", "label": "Moved measured photos into Measurements & Blueprints folder in Clients folder", "options": [], "required": true}]}]}	0	2025-01-15 21:12:15.593	2025-01-15 21:12:15.593	cm5yedwvy000p8of5nykwtj6o	cm5yedwva00038of57rgu7jra	t	{"sections": [{"id": "f9175559-1008-436c-9870-4bad3b3f9529", "type": "CHECKLIST", "title": "VEHICLE MEASUREMENT CHECKLIST", "fields": [{"id": "947914d7-8adc-46e1-8d9d-33d804044ec0", "type": "checkbox", "label": "Photographed all sides of vehicle straight on using iPad"}, {"id": "eb41bcca-6232-4177-bf09-b207f010f9b7", "type": "checkbox", "label": "Photographed VIN Number"}, {"id": "92fc270c-6f56-40fc-9f28-0f6f09ecb252", "type": "checkbox", "label": "Customers name written on first photographed"}, {"id": "4fdd184e-4f90-470c-88ee-571d25c22cbd", "type": "checkbox", "label": "Measured vehicle from furthest point to furthest point, horizontally and vertically, using different colors for each"}, {"id": "1c05cb26-c2c0-4eb7-96f1-da6f8fb157b6", "type": "checkbox", "label": "Marked measurements of locations of all door seams, indents, door handles, etc"}, {"id": "bc85d069-eab0-4860-a5d7-3bccebf82604", "type": "checkbox", "label": "Made note of any unwrappable areas"}, {"id": "6b281cdd-3a81-40b8-bfc5-f407fd4b4413", "type": "checkbox", "label": "Confirmed window coverage and measured accordingly"}, {"id": "53d142cc-29ed-42be-9baa-efbe8237c6a9", "type": "checkbox", "label": "Confirmed roof coverage and measured accordingly"}, {"id": "28d33882-524a-4432-b6e3-c3848eda1484", "type": "checkbox", "label": "Confirmed bumper coverage and measured accordingly"}, {"id": "06f3ea80-4fe9-46bd-bc8f-eed6cbde13fb", "type": "checkbox", "label": "Confirmed iPad Photos synced with Mac Photos"}, {"id": "9fff585d-4793-4440-8b4a-edf614289b16", "type": "checkbox", "label": "Moved photos from Mac Photos app into Before Photos folder in Clients folder"}, {"id": "192a9cb4-e3da-4f3d-88e8-53a9c11164cb", "type": "checkbox", "label": "Moved measured photos into Measurements & Blueprints folder in Clients folder"}]}]}	{"version": 1, "lastUpdated": "2025-01-15T21:12:15.592Z"}	{"theme": "default"}	1	cm5yedwvs00098of5lwopbywk	STANDARD
cm5yedwx800378of5xfmts5xv	GRAPHIC DESIGN CHECKLIST	Checklist for graphic design checklist	{"sections": [{"id": "713149c6-237d-4987-8ca1-6faf25bd6915", "type": "CHECKLIST", "title": "GRAPHIC DESIGN CHECKLIST", "fields": [{"id": "9deab22e-afe9-4623-bff6-22243de7dbd3", "type": "checkbox", "label": "Art Direction Form Completed", "options": [], "required": true}, {"id": "239555be-e84b-4b54-843c-02d1642cd30e", "type": "checkbox", "label": "Rough Mock-up Designed & saved to Design In Progress folder", "options": [], "required": true}, {"id": "b5f8d8d0-e7aa-4ec0-bbe8-d0ed28665623", "type": "checkbox", "label": "Rough Mock-up sent to Art Director for Approval", "options": [], "required": true}, {"id": "e0f1df22-5f21-44e2-8a36-641d1013688c", "type": "checkbox", "label": "Design sent to customer via GoProof using Proof Sheet", "options": [], "required": true}, {"id": "b2a56c20-d440-46cf-bb84-2645ea1422fd", "type": "checkbox", "label": "ROUGH MOCK APPROVED BY CLIENT", "options": [], "required": true}, {"id": "62da6afe-a4df-4b40-b923-179e91b2489e", "type": "checkbox", "label": "Pre-design layout meeting had with departments to review vehicle", "options": [], "required": true}, {"id": "a991e4d5-3cf3-47ec-8433-b21af7abb647", "type": "checkbox", "label": "Template Downloaded from 'TheBadWrap.com' or created from photos - Color Profile: sRGB IEC61966-2.1", "options": [], "required": true}, {"id": "8f4beae0-3636-4dfe-961a-903343248d08", "type": "checkbox", "label": "Template Confirmed using measurements/areas to avoid & placed in Empty Vehicle Templates", "options": [], "required": true}, {"id": "a8e4383b-1307-4a4b-a7ef-6447640fdf04", "type": "checkbox", "label": "Customer collateral confirmed - usable and located in Collaterals folder on server", "options": [], "required": true}, {"id": "bd2aedec-83b9-4835-ae0d-b169d2251be5", "type": "checkbox", "label": "High Resolution design made - all sides on confirmed template w/ locked Horizon line", "options": [], "required": true}, {"id": "61abca4a-fad9-483a-8098-29a871e7cf41", "type": "checkbox", "label": "Proof submitted for internal review/spell check and sent to client", "options": [], "required": true}, {"id": "d7ace90b-9afb-4d49-bf8b-6a15eb1d7f5c", "type": "checkbox", "label": "FINAL DESIGN APPROVED BY CLIENT -Approval Printed and placed in Traveler", "options": [], "required": true}, {"id": "4da02945-91d1-4bfc-b08c-c317fc3b5eb4", "type": "checkbox", "label": "Finalize Files & place in Final Designs folder", "options": [], "required": true}, {"id": "356c889f-6cea-4035-acee-1a2a399b175f", "type": "checkbox", "label": "IF CUT GRAPHICS ARE INCLUDED IN DESIGN: Cut Graphics created and placed in SummaCut Files folder", "options": [], "required": true}, {"id": "a29268e7-26bf-48ec-90ff-0b16f2227259", "type": "checkbox", "label": "Create Cut Graphics Form, Print, and place in traveler", "options": [], "required": true}, {"id": "de89a990-91b3-430b-8108-2411f1266984", "type": "checkbox", "label": "Create Blueprints, Print and place in traveler", "options": [], "required": true}, {"id": "59d40089-92c5-4144-8c95-98190a9dacb4", "type": "checkbox", "label": "All Final Approved all sided proofs printed as separate pages and on one single sheet and placed in traveler", "options": [], "required": true}, {"id": "e636a613-5d88-4dcc-a399-6118774f1a0e", "type": "checkbox", "label": "Full-Size Before Pictures printed and placed in traveler", "options": [], "required": true}, {"id": "a5fbf1eb-75f9-448d-a609-92a605a41957", "type": "checkbox", "label": "Customer Approval printed and placed in traveler", "options": [], "required": true}, {"id": "86aac5df-7801-4434-9581-50e5c4b0b27f", "type": "checkbox", "label": "IF REPEAT PROJECT: After Pictures of last wrap printed and placed in traveler;CHECK Flett Box on print sheet", "options": [], "required": true}]}]}	0	2025-01-15 21:12:15.596	2025-01-15 21:12:15.596	cm5yedwvy000p8of5nykwtj6o	cm5yedwva00038of57rgu7jra	t	{"sections": [{"id": "fa2ea1cc-fd97-47c0-bdc9-ee81e9c94de9", "type": "CHECKLIST", "title": "GRAPHIC DESIGN CHECKLIST", "fields": [{"id": "63d2f94c-6b9b-49e5-8698-2b116d928552", "type": "checkbox", "label": "Art Direction Form Completed"}, {"id": "3ec4063a-6eb8-4dce-9b6a-90b669248d8d", "type": "checkbox", "label": "Rough Mock-up Designed & saved to Design In Progress folder"}, {"id": "7202d3c9-3197-412b-a21e-52f92cdd4ac5", "type": "checkbox", "label": "Rough Mock-up sent to Art Director for Approval"}, {"id": "e5cdf07e-ad07-48a6-bbd0-6da36858afd9", "type": "checkbox", "label": "Design sent to customer via GoProof using Proof Sheet"}, {"id": "ba70fd0f-6b84-43ef-bf1f-5ab2b207d115", "type": "checkbox", "label": "ROUGH MOCK APPROVED BY CLIENT"}, {"id": "b89b0318-7b35-482b-97de-b66f91ccfe53", "type": "checkbox", "label": "Pre-design layout meeting had with departments to review vehicle"}, {"id": "6ff4c4ce-feb3-4a6b-9a00-bcae6f5756a7", "type": "checkbox", "label": "Template Downloaded from 'TheBadWrap.com' or created from photos - Color Profile: sRGB IEC61966-2.1"}, {"id": "5d2edf00-6b74-4b7b-8bf9-c9b12ca1fde0", "type": "checkbox", "label": "Template Confirmed using measurements/areas to avoid & placed in Empty Vehicle Templates"}, {"id": "1976dc69-3af8-4c1f-a430-6c94e81a687c", "type": "checkbox", "label": "Customer collateral confirmed - usable and located in Collaterals folder on server"}, {"id": "641257d9-61df-42f4-9843-8f05db591797", "type": "checkbox", "label": "High Resolution design made - all sides on confirmed template w/ locked Horizon line"}, {"id": "39206bd8-05db-4a11-a6e4-efc2af92b435", "type": "checkbox", "label": "Proof submitted for internal review/spell check and sent to client"}, {"id": "653048b9-cc86-4b4c-b379-304e32901e47", "type": "checkbox", "label": "FINAL DESIGN APPROVED BY CLIENT -Approval Printed and placed in Traveler"}, {"id": "d09ec944-3700-487f-bf1b-d58b0dfa0c87", "type": "checkbox", "label": "Finalize Files & place in Final Designs folder"}, {"id": "d57e3570-2b47-40a3-82d1-74e45d995648", "type": "checkbox", "label": "IF CUT GRAPHICS ARE INCLUDED IN DESIGN: Cut Graphics created and placed in SummaCut Files folder"}, {"id": "786f78fd-aa6a-4b6b-83d2-7a1fea20e76f", "type": "checkbox", "label": "Create Cut Graphics Form, Print, and place in traveler"}, {"id": "9264d89e-48e1-4fd6-978f-81e7e7cec78d", "type": "checkbox", "label": "Create Blueprints, Print and place in traveler"}, {"id": "1d3a37a3-1720-476b-b315-f346f30385b4", "type": "checkbox", "label": "All Final Approved all sided proofs printed as separate pages and on one single sheet and placed in traveler"}, {"id": "d63deca3-421a-4448-aaee-7f322b46f3c0", "type": "checkbox", "label": "Full-Size Before Pictures printed and placed in traveler"}, {"id": "7bea00c8-ae40-476b-b44a-603f1091f66a", "type": "checkbox", "label": "Customer Approval printed and placed in traveler"}, {"id": "b6a994d3-5d51-4adf-bd0d-e131ee9256e8", "type": "checkbox", "label": "IF REPEAT PROJECT: After Pictures of last wrap printed and placed in traveler;CHECK Flett Box on print sheet"}]}]}	{"version": 1, "lastUpdated": "2025-01-15T21:12:15.595Z"}	{"theme": "default"}	1	cm5yedwvs00098of5lwopbywk	STANDARD
cm5yedwxc003b8of5cmyo3m99	PANELING/PREPRESS CHECKLIST	Checklist for paneling/prepress checklist	{"sections": [{"id": "1b54f680-fa71-41c1-8040-7b19b2166c7b", "type": "CHECKLIST", "title": "PANELING/PREPRESS CHECKLIST", "fields": [{"id": "2305b825-676f-4c46-9b86-1b11dcb5cec6", "type": "checkbox", "label": "Confirmed previous departments paperwork is signed off", "options": [], "required": true}, {"id": "2fff1475-e17c-4329-91dd-7a716e6adaa4", "type": "checkbox", "label": "Printed approval and final files compared (must be the same)", "options": [], "required": true}, {"id": "1846aa65-e2b9-4162-a253-bfcc719b4117", "type": "checkbox", "label": "Confirmed template verification was completed. Checked Non-wrapable areas", "options": [], "required": true}, {"id": "4ea61ff3-55fe-4ca0-b879-ecf07f2e4ff5", "type": "checkbox", "label": "Confirmed proper file settings", "options": [], "required": true}, {"id": "96d1b3ad-d17b-4915-ad81-6ca925919914", "type": "checkbox", "label": "Confirmed text has been converted to shape or has anti-aliasing on and is made into smart object", "options": [], "required": true}, {"id": "aabead8b-1f26-451f-a0be-08ac513e4e2a", "type": "checkbox", "label": "Confirmed proper blue prints/mechanicals/cut graphics form/proofs/photos attached", "options": [], "required": true}, {"id": "ac7ec2b6-05ff-4694-bb72-246c9a0da239", "type": "checkbox", "label": "Confirmed the necessary bleed was added", "options": [], "required": true}, {"id": "9db8fd67-d50f-40fa-adde-8e43e0624f4c", "type": "checkbox", "label": "Spell Check / Contact Info Check Completed", "options": [], "required": true}, {"id": "ff0c246c-ad44-4556-a71f-1b2d05f8bd6d", "type": "checkbox", "label": "Panels for each side MUST be paneled from final design for THAT side, even if the 'same'", "options": [], "required": true}, {"id": "3c20f58e-0c15-4e8c-964a-fd2dd2fb7f7f", "type": "checkbox", "label": "Files zoomed and checked for graphical errors (with template and guides off)", "options": [], "required": true}, {"id": "1dea09c5-b077-46f5-b149-4b6b98f722a1", "type": "checkbox", "label": "Files checked for issues caused by mirroring sides or elements... ALL SIDES, not just Passenger/Driver", "options": [], "required": true}, {"id": "8cc164c8-e15b-4a34-a433-157944a885a0", "type": "checkbox", "label": "Pre-Install meeting had with installer to set up panel plan and review install", "options": [], "required": true}, {"id": "3d90bf35-294b-4760-967c-3e6af35ce267", "type": "checkbox", "label": "Panel Plan group created in layers", "options": [], "required": true}, {"id": "91e54c2b-e8d6-47c3-817b-567287be5dbf", "type": "checkbox", "label": "Panels cropped out and saved as TIF files in Print Ready Panels folder", "options": [], "required": true}, {"id": "fac5dd2d-d5a8-4ce9-8e60-8fb643a32668", "type": "checkbox", "label": "Panel Plan Sheet filled out to confirm measurements", "options": [], "required": true}, {"id": "617c7c1d-3d79-4be2-b923-996d321a3d05", "type": "checkbox", "label": "Panel Plan printed for ALL SIDES of vehicle whether side has panels or not", "options": [], "required": true}, {"id": "ef881caa-ff09-432a-be7a-8912fa0eb3ac", "type": "checkbox", "label": "Contact Sheet of cropped panels printed using Adobe Bridge", "options": [], "required": true}, {"id": "2a33f337-949b-4c91-a951-5ad6ac92f097", "type": "checkbox", "label": "Confirmed color consistency using Contact Sheet", "options": [], "required": true}]}]}	0	2025-01-15 21:12:15.6	2025-01-15 21:12:15.6	cm5yedwvy000p8of5nykwtj6o	cm5yedwva00038of57rgu7jra	t	{"sections": [{"id": "c69d41a8-0f62-46a8-84b1-d83c5ae01ded", "type": "CHECKLIST", "title": "PANELING/PREPRESS CHECKLIST", "fields": [{"id": "ad07eb77-9cea-47f9-898c-5477a28001d0", "type": "checkbox", "label": "Confirmed previous departments paperwork is signed off"}, {"id": "08fb44d9-e49f-4a2d-a4ad-e5afe39b5611", "type": "checkbox", "label": "Printed approval and final files compared (must be the same)"}, {"id": "40304613-2cb7-4ff4-b8d7-247dd2f6012f", "type": "checkbox", "label": "Confirmed template verification was completed. Checked Non-wrapable areas"}, {"id": "fa171448-a98f-4a66-8624-df0301383d98", "type": "checkbox", "label": "Confirmed proper file settings"}, {"id": "e5bbf7b5-a9c1-48f7-928a-5d458032bab7", "type": "checkbox", "label": "Confirmed text has been converted to shape or has anti-aliasing on and is made into smart object"}, {"id": "b755e80f-a014-4492-8174-bc843a59d8f8", "type": "checkbox", "label": "Confirmed proper blue prints/mechanicals/cut graphics form/proofs/photos attached"}, {"id": "1bed6aca-51b9-43dd-8b2c-cb2927957e2b", "type": "checkbox", "label": "Confirmed the necessary bleed was added"}, {"id": "4320840a-1a13-45b3-b58a-0a00e6071a29", "type": "checkbox", "label": "Spell Check / Contact Info Check Completed"}, {"id": "b8450c30-3e51-4e52-a264-9e646d804026", "type": "checkbox", "label": "Panels for each side MUST be paneled from final design for THAT side, even if the 'same'"}, {"id": "ba3f377a-788c-4ac6-9a41-0eb1a74fdf11", "type": "checkbox", "label": "Files zoomed and checked for graphical errors (with template and guides off)"}, {"id": "877a79cb-c1e5-4893-acda-8f6dc9bb9923", "type": "checkbox", "label": "Files checked for issues caused by mirroring sides or elements... ALL SIDES, not just Passenger/Driver"}, {"id": "03e5080f-1d7e-4b01-b8c3-8f49f3a6c443", "type": "checkbox", "label": "Pre-Install meeting had with installer to set up panel plan and review install"}, {"id": "878fcbe4-b493-4f87-8d5e-6913363a9e74", "type": "checkbox", "label": "Panel Plan group created in layers"}, {"id": "bfdb76c6-9bbf-457e-8ccc-db5245e0eb02", "type": "checkbox", "label": "Panels cropped out and saved as TIF files in Print Ready Panels folder"}, {"id": "5ca4a56e-7adc-4d5a-85b5-7cee7fe66d8d", "type": "checkbox", "label": "Panel Plan Sheet filled out to confirm measurements"}, {"id": "e842f490-a62e-4ca1-aef7-40f69e593b31", "type": "checkbox", "label": "Panel Plan printed for ALL SIDES of vehicle whether side has panels or not"}, {"id": "a33f49f1-d11c-44d9-b1c2-4e801f3c88e0", "type": "checkbox", "label": "Contact Sheet of cropped panels printed using Adobe Bridge"}, {"id": "c0103f51-e5c4-49a9-82a3-74cadf3d66c0", "type": "checkbox", "label": "Confirmed color consistency using Contact Sheet"}]}]}	{"version": 1, "lastUpdated": "2025-01-15T21:12:15.599Z"}	{"theme": "default"}	1	cm5yedwvs00098of5lwopbywk	STANDARD
cm5yedwxh003f8of540vmw3bt	PRINT CHECKLIST	Checklist for print checklist	{"sections": [{"id": "318d5cc4-db5d-4534-95f8-abbf9d7e2fce", "type": "CHECKLIST", "title": "PRINT CHECKLIST", "fields": [{"id": "d1618e65-0339-4427-94a4-3b66a77b79c1", "type": "checkbox", "label": "CONFIRMED PRINTER IS UP TO DATE WITH PREVENTATIVE MAINTENANCE", "options": [], "required": true}, {"id": "cd3f6a48-b18f-46be-9d78-5c929ae505fd", "type": "checkbox", "label": "Performed a Full Print Optimization Process", "options": [], "required": true}, {"id": "6dc170f8-5072-47be-81da-1d2d57a543e4", "type": "checkbox", "label": "Confirmed that 'space between print' settings in ONYX is .5' for standard; 2.5-3' for cut graphics using plotter", "options": [], "required": true}, {"id": "a8655b47-9daa-4f84-bc5e-33669a88ef14", "type": "checkbox", "label": "Confirmed that substrate in printer matches job requirements for the project", "options": [], "required": true}, {"id": "1d17e951-732b-451c-8ca6-e56b38b70f96", "type": "checkbox", "label": "Confirmed that printer has enough substrate as required for what you just loaded to print", "options": [], "required": true}, {"id": "9705fa3a-b6c2-4f79-84ba-1a9524dc290e", "type": "checkbox", "label": "Confirmed that take up roll is attached to vinyl in printer (or a plan for catching vinyl is set)", "options": [], "required": true}, {"id": "ba3f00f5-c488-4b29-91d3-7890379f9740", "type": "checkbox", "label": "Confirmed that substrate in printer was advanced if needed for tape marks and/or damaged areas to clear the final printing area", "options": [], "required": true}, {"id": "fb07fc86-2229-4e33-888d-fb06fdb61dcb", "type": "checkbox", "label": "Confirmed that all panels being printed have been TURNED and EXPANDED to ACTUAL PRINT SIZE", "options": [], "required": true}, {"id": "90b413c2-17f1-4a27-9d3d-7dd09288f9ba", "type": "checkbox", "label": "Confirmed wrap panels with white backgrounds have crop marks/frame to aid in cutting", "options": [], "required": true}, {"id": "91e987b2-87a9-488e-ba15-4a2d75eb9d06", "type": "checkbox", "label": "Confirm edge clips are in proper position", "options": [], "required": true}, {"id": "162f0eef-2337-4cd4-8f04-3b7fb9eb8499", "type": "checkbox", "label": "Confirmed that if multiple PRINT CUTS jobs are being printed, 'conserve media' is NOT selected and they are printed as individual jobs with their own barcodes", "options": [], "required": true}, {"id": "ef159446-c557-4c40-b964-688ceaeb02ec", "type": "checkbox", "label": "Confirmed that all ink levels in printer are ready to print. MUST BE IN THE SHOP to change inks if any color is less than 10% full or a solid color is being printed", "options": [], "required": true}, {"id": "91029d1f-220f-408c-a50c-a15fd4a44709", "type": "checkbox", "label": "Changed Ink Cartridges below 10%, if necessary, when setting up printer for overnight printing", "options": [], "required": true}, {"id": "58be3168-4f6e-43a8-9a2c-af4613393668", "type": "checkbox", "label": "Confirmed gutter is included in print MUST GET SIGN OFF TO NOT INCLUDE", "options": [], "required": true}, {"id": "f24f6e76-257c-43e8-8aeb-cc6d84a428f2", "type": "checkbox", "label": "Print Test Prints: To test photo quality and colors MUST GET SIGNED; View outside", "options": [], "required": true}, {"id": "7160a72c-0329-4e5e-b6d6-a561a816ed35", "type": "checkbox", "label": "Before photo printed for rolling wall", "options": [], "required": true}, {"id": "c3fa7af3-c3ea-47cc-b793-5825d7f803d7", "type": "checkbox", "label": "Compared Printed Color to Paint Wrap if color Paint Wrap is being used", "options": [], "required": true}, {"id": "37183ba2-22cc-463f-9f0d-fd7bd59c7f20", "type": "checkbox", "label": "If Wrap is from a Fleet (see check box at top of page) Compared Printed Sample to Past Printed Sample/photo(s)", "options": [], "required": true}, {"id": "a9332903-66c4-43df-8e39-5f9b22268182", "type": "checkbox", "label": "Vinyl usage under 85% must be discussed", "options": [], "required": true}, {"id": "7ebf309c-3582-411b-a0d3-a3ba570cb26d", "type": "checkbox", "label": "Printer must be watched while printing first panel and checked every 10 minutes to confirm no issues occur", "options": [], "required": true}]}]}	0	2025-01-15 21:12:15.605	2025-01-15 21:12:15.605	cm5yedww7001d8of5v3g5sj43	cm5yedwvc00068of50409aizp	t	{"sections": [{"id": "3b0c8f2e-b38d-439a-b7d6-fc633e986fea", "type": "CHECKLIST", "title": "PRINT CHECKLIST", "fields": [{"id": "f2d0c42e-8a92-4838-acb3-28474578d9e9", "type": "checkbox", "label": "CONFIRMED PRINTER IS UP TO DATE WITH PREVENTATIVE MAINTENANCE"}, {"id": "1b72ae7c-8743-4ddc-b7ec-bbc63fa3e786", "type": "checkbox", "label": "Performed a Full Print Optimization Process"}, {"id": "b6ea151d-1d53-4a65-9d9d-b623258182da", "type": "checkbox", "label": "Confirmed that 'space between print' settings in ONYX is .5' for standard; 2.5-3' for cut graphics using plotter"}, {"id": "4e71fc71-29ff-477e-840e-a07bd7baea48", "type": "checkbox", "label": "Confirmed that substrate in printer matches job requirements for the project"}, {"id": "609adb19-78c8-4f4f-b560-a20764bc29af", "type": "checkbox", "label": "Confirmed that printer has enough substrate as required for what you just loaded to print"}, {"id": "51d7cb10-626f-46af-9eb1-24e61e5a4126", "type": "checkbox", "label": "Confirmed that take up roll is attached to vinyl in printer (or a plan for catching vinyl is set)"}, {"id": "d29d8395-aaa7-4545-99d2-aa959fa1ec4b", "type": "checkbox", "label": "Confirmed that substrate in printer was advanced if needed for tape marks and/or damaged areas to clear the final printing area"}, {"id": "8893690a-7cf5-4404-8435-758cee9b3ed5", "type": "checkbox", "label": "Confirmed that all panels being printed have been TURNED and EXPANDED to ACTUAL PRINT SIZE"}, {"id": "e5ec096b-7188-41f2-a34e-dfc922bc8edf", "type": "checkbox", "label": "Confirmed wrap panels with white backgrounds have crop marks/frame to aid in cutting"}, {"id": "44742c9e-02c1-4b83-a703-ef3f00a16e7f", "type": "checkbox", "label": "Confirm edge clips are in proper position"}, {"id": "f02f993c-732e-4598-8217-374f3eff2006", "type": "checkbox", "label": "Confirmed that if multiple PRINT CUTS jobs are being printed, 'conserve media' is NOT selected and they are printed as individual jobs with their own barcodes"}, {"id": "1cfbbada-cfbe-4412-9fde-a1eba4d4ebc2", "type": "checkbox", "label": "Confirmed that all ink levels in printer are ready to print. MUST BE IN THE SHOP to change inks if any color is less than 10% full or a solid color is being printed"}, {"id": "1a66c3f9-db9c-4e89-a9be-df8e308f0c2b", "type": "checkbox", "label": "Changed Ink Cartridges below 10%, if necessary, when setting up printer for overnight printing"}, {"id": "4168058d-cdf5-4a16-abc9-4956f217028d", "type": "checkbox", "label": "Confirmed gutter is included in print MUST GET SIGN OFF TO NOT INCLUDE"}, {"id": "307fd90a-718f-4a1a-8b7b-7630e09fb48a", "type": "checkbox", "label": "Print Test Prints: To test photo quality and colors MUST GET SIGNED; View outside"}, {"id": "512692be-79d8-4bd2-910c-ea2545cd92a8", "type": "checkbox", "label": "Before photo printed for rolling wall"}, {"id": "a7ea6705-a365-4ceb-8c02-566c497cd84c", "type": "checkbox", "label": "Compared Printed Color to Paint Wrap if color Paint Wrap is being used"}, {"id": "27fe1438-4ea4-4b12-9df4-63f0c8f721ce", "type": "checkbox", "label": "If Wrap is from a Fleet (see check box at top of page) Compared Printed Sample to Past Printed Sample/photo(s)"}, {"id": "dca4433a-535c-4bd5-a002-7da259b5f1b4", "type": "checkbox", "label": "Vinyl usage under 85% must be discussed"}, {"id": "02974ffd-4f89-4df9-84d1-6a37685f4ed1", "type": "checkbox", "label": "Printer must be watched while printing first panel and checked every 10 minutes to confirm no issues occur"}]}]}	{"version": 1, "lastUpdated": "2025-01-15T21:12:15.604Z"}	{"theme": "default"}	1	cm5yedwvs00098of5lwopbywk	STANDARD
cm5yedwxl003j8of5ky8fev9f	LAMINATION & TRIMMING CHECKLIST	Checklist for lamination & trimming checklist	{"sections": [{"id": "47213eae-46ba-47ae-9b76-50d43adac330", "type": "CHECKLIST", "title": "LAMINATION & TRIMMING CHECKLIST", "fields": [{"id": "c549e741-9457-4315-8fd6-914e57461460", "type": "checkbox", "label": "CONFIRMED WHETHER LAMINATION IS NEEDED OR NOT, CHECK PRINT PAPERWORK", "options": [], "required": true}, {"id": "7c012a8f-8fc9-44c2-a81f-d2ced44ae4cb", "type": "checkbox", "label": "Confirmed there is enough lamination to complete your project", "options": [], "required": true}, {"id": "6e016f36-dcd2-46bd-9f72-8162e338105d", "type": "checkbox", "label": "Load vinyl roll on proper bar depending on length of project", "options": [], "required": true}, {"id": "574a24c9-245c-47e5-9656-10920f122ba3", "type": "checkbox", "label": "Attached take up real for long runs or if you are laminating alone", "options": [], "required": true}, {"id": "032daed4-e036-4767-b8cb-0d4845b9e4f3", "type": "checkbox", "label": "Reviewed panels while lamination occurs for obvious issues", "options": [], "required": true}, {"id": "2263d4c6-2a86-4574-8da2-04a5ddda9356", "type": "checkbox", "label": "Swiffered panels as they are being laminated to reduce lint, dirt ect.", "options": [], "required": true}, {"id": "d627e571-ca35-46ee-ac8e-3b35753c4603", "type": "checkbox", "label": "Confirmed panels that are laminated - if possible may need to occur during trim; CHECKLIST", "options": [], "required": true}, {"id": "6bc68da9-b523-4fee-8f81-87d9f0cbca36", "type": "checkbox", "label": "Trimmed panels leaving 5' at both ends of Print Cut files and removing excess lamination!", "options": [], "required": true}, {"id": "c13a9617-1e84-46aa-ac8b-36b310ed4e8e", "type": "checkbox", "label": "Trim panels that need to be sewn together and compare edges to confirm color matches", "options": [], "required": true}, {"id": "742ce1af-7f91-4d38-a135-e1a9169f6ee6", "type": "checkbox", "label": "Confirm COMPLETE panel inventory and package/cart project for installation; CHECKLIST", "options": [], "required": true}]}]}	0	2025-01-15 21:12:15.61	2025-01-15 21:12:15.61	cm5yedww7001d8of5v3g5sj43	cm5yedwvc00068of50409aizp	t	{"sections": [{"id": "7d3f2341-753f-448d-a284-fcc074969891", "type": "CHECKLIST", "title": "LAMINATION & TRIMMING CHECKLIST", "fields": [{"id": "e11bdcc9-5b86-47dd-bae4-460bf266df78", "type": "checkbox", "label": "CONFIRMED WHETHER LAMINATION IS NEEDED OR NOT, CHECK PRINT PAPERWORK"}, {"id": "debab2c7-a611-4805-b1e1-30dd6efc898b", "type": "checkbox", "label": "Confirmed there is enough lamination to complete your project"}, {"id": "0b7c9488-32b4-4acf-a21a-753390bbcfe2", "type": "checkbox", "label": "Load vinyl roll on proper bar depending on length of project"}, {"id": "2438a1d3-5be6-49f1-814b-599adcac828b", "type": "checkbox", "label": "Attached take up real for long runs or if you are laminating alone"}, {"id": "f6e61a9c-20c4-4f3c-a520-1652f91874ef", "type": "checkbox", "label": "Reviewed panels while lamination occurs for obvious issues"}, {"id": "55f02924-bb7c-4111-bbee-35ed02d4c4d4", "type": "checkbox", "label": "Swiffered panels as they are being laminated to reduce lint, dirt ect."}, {"id": "5a29abc4-cca2-4026-a9c5-92c67294202d", "type": "checkbox", "label": "Confirmed panels that are laminated - if possible may need to occur during trim; CHECKLIST"}, {"id": "dcb6b7cd-2d96-4d4e-b24a-5bcaeaf85a86", "type": "checkbox", "label": "Trimmed panels leaving 5' at both ends of Print Cut files and removing excess lamination!"}, {"id": "c8ccfaff-e41c-454e-8cb9-b42776ce6156", "type": "checkbox", "label": "Trim panels that need to be sewn together and compare edges to confirm color matches"}, {"id": "80ced4f7-1028-4616-b45a-8bbc73d87839", "type": "checkbox", "label": "Confirm COMPLETE panel inventory and package/cart project for installation; CHECKLIST"}]}]}	{"version": 1, "lastUpdated": "2025-01-15T21:12:15.609Z"}	{"theme": "default"}	1	cm5yedwvs00098of5lwopbywk	STANDARD
\.


--
-- Data for Name: FormVersion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FormVersion" (id, version, "templateId", schema, layout, style, metadata, "isActive", "createdAt", "createdById", changelog) FROM stdin;
cm5yedwwx00318of5k7s3aumd	1	cm5yedwwx002z8of5ux5ihyer	{"sections": [{"id": "92ca35a0-28c1-4b2d-9926-886c281039cc", "type": "CHECKLIST", "title": "PRE-DESIGN LAYOUT MEETING", "fields": [{"id": "c0eaf900-6d02-455d-b063-5d59aee27b16", "type": "checkbox", "label": "Review physical inspection form(s) with all departments", "options": [], "required": true}, {"id": "55a54818-9595-42f0-8639-79a6a8326ee4", "type": "checkbox", "label": "Review & document wrapable areas", "options": [], "required": true}, {"id": "38c161c1-1076-4dfb-b424-342f3a1b2436", "type": "checkbox", "label": "Review & document un-wrapable areas", "options": [], "required": true}, {"id": "326c7b7d-ab17-43f3-836f-056651271478", "type": "checkbox", "label": "General design do & don't review", "options": [], "required": true}, {"id": "bcde7b27-7f45-4520-8d05-feb0335e86b4", "type": "checkbox", "label": "Seams and panel plan reviewed", "options": [], "required": true}]}]}	\N	\N	\N	t	2025-01-15 21:12:15.585	cm5yedwv100008of5qc9th6aq	Initial version
cm5yedwx500358of5xj34ile4	1	cm5yedwx500338of5vgg9zttq	{"sections": [{"id": "0ed9b6f3-8164-4ab4-92f0-0b6302b658d5", "type": "CHECKLIST", "title": "VEHICLE MEASUREMENT CHECKLIST", "fields": [{"id": "f19d7408-4ecb-43f7-9b0b-afe1b62d7149", "type": "checkbox", "label": "Photographed all sides of vehicle straight on using iPad", "options": [], "required": true}, {"id": "b186c9d9-c17f-4c90-a72e-2fe621f402e0", "type": "checkbox", "label": "Photographed VIN Number", "options": [], "required": true}, {"id": "5491279a-b329-42e1-9a6f-f4ee5e425a15", "type": "checkbox", "label": "Customers name written on first photographed", "options": [], "required": true}, {"id": "3b06d51b-5c9f-41a5-9212-2876e81393ce", "type": "checkbox", "label": "Measured vehicle from furthest point to furthest point, horizontally and vertically, using different colors for each", "options": [], "required": true}, {"id": "8aa7b49b-0d0c-4f84-a719-90845a7835f2", "type": "checkbox", "label": "Marked measurements of locations of all door seams, indents, door handles, etc", "options": [], "required": true}, {"id": "0ab6cc75-2b09-4db4-a1ce-5a79dbace769", "type": "checkbox", "label": "Made note of any unwrappable areas", "options": [], "required": true}, {"id": "3f5426f1-7e13-4221-ae23-0156c7cddaf9", "type": "checkbox", "label": "Confirmed window coverage and measured accordingly", "options": [], "required": true}, {"id": "2dc0eb34-3439-4561-9015-08e41a6cf7fb", "type": "checkbox", "label": "Confirmed roof coverage and measured accordingly", "options": [], "required": true}, {"id": "7b36a8a8-f0f3-499a-a519-35e544d29841", "type": "checkbox", "label": "Confirmed bumper coverage and measured accordingly", "options": [], "required": true}, {"id": "6f74294e-bdf7-4373-a3ce-cb917d24f1c4", "type": "checkbox", "label": "Confirmed iPad Photos synced with Mac Photos", "options": [], "required": true}, {"id": "54fd183f-c522-49c5-afe0-3acc6b1bb44f", "type": "checkbox", "label": "Moved photos from Mac Photos app into Before Photos folder in Clients folder", "options": [], "required": true}, {"id": "a41640ef-0997-4ed1-8160-601e44ddcee6", "type": "checkbox", "label": "Moved measured photos into Measurements & Blueprints folder in Clients folder", "options": [], "required": true}]}]}	\N	\N	\N	t	2025-01-15 21:12:15.593	cm5yedwv100008of5qc9th6aq	Initial version
cm5yedwx800398of55pa1h3d0	1	cm5yedwx800378of5xfmts5xv	{"sections": [{"id": "151f5866-f8ed-4618-b71b-a8e3dc6d63c6", "type": "CHECKLIST", "title": "GRAPHIC DESIGN CHECKLIST", "fields": [{"id": "d8854221-bfde-4fef-a083-028b48c32d30", "type": "checkbox", "label": "Art Direction Form Completed", "options": [], "required": true}, {"id": "8924803b-e676-48e5-aec8-4c4f91326b77", "type": "checkbox", "label": "Rough Mock-up Designed & saved to Design In Progress folder", "options": [], "required": true}, {"id": "33e68b7a-41c3-48ac-9673-2e389658d523", "type": "checkbox", "label": "Rough Mock-up sent to Art Director for Approval", "options": [], "required": true}, {"id": "f45531f2-3fb3-4cbd-9d7a-becabbe7a335", "type": "checkbox", "label": "Design sent to customer via GoProof using Proof Sheet", "options": [], "required": true}, {"id": "4f6592fd-599e-4fad-b2e4-40607d51de7d", "type": "checkbox", "label": "ROUGH MOCK APPROVED BY CLIENT", "options": [], "required": true}, {"id": "32e6bf34-8c2f-4774-a5a8-0fcae1d01063", "type": "checkbox", "label": "Pre-design layout meeting had with departments to review vehicle", "options": [], "required": true}, {"id": "d8e22328-2d3c-4eeb-bd50-cfbcfd924060", "type": "checkbox", "label": "Template Downloaded from 'TheBadWrap.com' or created from photos - Color Profile: sRGB IEC61966-2.1", "options": [], "required": true}, {"id": "841fcbf7-8424-47e4-ba0d-e737dea2e47b", "type": "checkbox", "label": "Template Confirmed using measurements/areas to avoid & placed in Empty Vehicle Templates", "options": [], "required": true}, {"id": "ca9a8bce-610d-4929-a8e0-434dc112245f", "type": "checkbox", "label": "Customer collateral confirmed - usable and located in Collaterals folder on server", "options": [], "required": true}, {"id": "4984c472-5e5a-410c-a97c-21840f842de9", "type": "checkbox", "label": "High Resolution design made - all sides on confirmed template w/ locked Horizon line", "options": [], "required": true}, {"id": "08372dc3-4265-43ca-941e-dd3c41db994a", "type": "checkbox", "label": "Proof submitted for internal review/spell check and sent to client", "options": [], "required": true}, {"id": "4920690d-3a84-46f6-93cb-f2d6e1b9c065", "type": "checkbox", "label": "FINAL DESIGN APPROVED BY CLIENT -Approval Printed and placed in Traveler", "options": [], "required": true}, {"id": "124f588c-be9f-41dc-a668-6142edc3709c", "type": "checkbox", "label": "Finalize Files & place in Final Designs folder", "options": [], "required": true}, {"id": "b2d30eca-2ab6-4036-887e-920476236394", "type": "checkbox", "label": "IF CUT GRAPHICS ARE INCLUDED IN DESIGN: Cut Graphics created and placed in SummaCut Files folder", "options": [], "required": true}, {"id": "bcbc16ed-185a-42bd-871b-b65124cbff3e", "type": "checkbox", "label": "Create Cut Graphics Form, Print, and place in traveler", "options": [], "required": true}, {"id": "9e86c04e-3ac2-471f-a611-5783e8e97087", "type": "checkbox", "label": "Create Blueprints, Print and place in traveler", "options": [], "required": true}, {"id": "6f059dfe-93cc-495a-85fb-5870cf9f0c48", "type": "checkbox", "label": "All Final Approved all sided proofs printed as separate pages and on one single sheet and placed in traveler", "options": [], "required": true}, {"id": "6edfe098-3696-4dc7-b346-9b137565e2a2", "type": "checkbox", "label": "Full-Size Before Pictures printed and placed in traveler", "options": [], "required": true}, {"id": "44cff2b3-7310-4691-a25d-df07ae5856b7", "type": "checkbox", "label": "Customer Approval printed and placed in traveler", "options": [], "required": true}, {"id": "47dd41ba-8a60-48d4-93bc-30dc3c054fb7", "type": "checkbox", "label": "IF REPEAT PROJECT: After Pictures of last wrap printed and placed in traveler;CHECK Flett Box on print sheet", "options": [], "required": true}]}]}	\N	\N	\N	t	2025-01-15 21:12:15.596	cm5yedwv100008of5qc9th6aq	Initial version
cm5yedwxc003d8of5s1yiqfyn	1	cm5yedwxc003b8of5cmyo3m99	{"sections": [{"id": "474c73fc-5c64-46ec-9c1a-200b3c78d8a5", "type": "CHECKLIST", "title": "PANELING/PREPRESS CHECKLIST", "fields": [{"id": "d0c014ab-2e36-43d3-a51c-d0ed03c69bc9", "type": "checkbox", "label": "Confirmed previous departments paperwork is signed off", "options": [], "required": true}, {"id": "ce985ea5-0c49-4037-87ae-3f4e7d9943f6", "type": "checkbox", "label": "Printed approval and final files compared (must be the same)", "options": [], "required": true}, {"id": "5149a653-439e-4327-a312-8022a7285d4c", "type": "checkbox", "label": "Confirmed template verification was completed. Checked Non-wrapable areas", "options": [], "required": true}, {"id": "a014b5bc-c224-4378-b714-9e4ba493ddb1", "type": "checkbox", "label": "Confirmed proper file settings", "options": [], "required": true}, {"id": "82979f83-28ef-4f9e-a287-50eb6a314477", "type": "checkbox", "label": "Confirmed text has been converted to shape or has anti-aliasing on and is made into smart object", "options": [], "required": true}, {"id": "18602573-f70b-4fd0-9bee-a2c5979b19c1", "type": "checkbox", "label": "Confirmed proper blue prints/mechanicals/cut graphics form/proofs/photos attached", "options": [], "required": true}, {"id": "26270f03-6c55-481f-97eb-523b52d30129", "type": "checkbox", "label": "Confirmed the necessary bleed was added", "options": [], "required": true}, {"id": "fe9f42ab-8ca6-4245-a1cb-d9d32aa9d527", "type": "checkbox", "label": "Spell Check / Contact Info Check Completed", "options": [], "required": true}, {"id": "490959c1-2bfa-421b-b989-e5994ffb1e04", "type": "checkbox", "label": "Panels for each side MUST be paneled from final design for THAT side, even if the 'same'", "options": [], "required": true}, {"id": "8382e4dd-e738-45e2-a06e-1a93709526d3", "type": "checkbox", "label": "Files zoomed and checked for graphical errors (with template and guides off)", "options": [], "required": true}, {"id": "07dda19a-2636-464f-a8f8-cd983c650791", "type": "checkbox", "label": "Files checked for issues caused by mirroring sides or elements... ALL SIDES, not just Passenger/Driver", "options": [], "required": true}, {"id": "cdda35f1-163a-47d2-949c-cd36290afa9d", "type": "checkbox", "label": "Pre-Install meeting had with installer to set up panel plan and review install", "options": [], "required": true}, {"id": "b65ee701-a24e-4990-8b3e-3320e8b96585", "type": "checkbox", "label": "Panel Plan group created in layers", "options": [], "required": true}, {"id": "00cb8d3b-3f97-42b5-aa16-2ae77744e5f1", "type": "checkbox", "label": "Panels cropped out and saved as TIF files in Print Ready Panels folder", "options": [], "required": true}, {"id": "78e6f5ab-9d02-4985-a338-2aff60875845", "type": "checkbox", "label": "Panel Plan Sheet filled out to confirm measurements", "options": [], "required": true}, {"id": "d2ccc64d-5819-497f-b88f-ac46ce0609cf", "type": "checkbox", "label": "Panel Plan printed for ALL SIDES of vehicle whether side has panels or not", "options": [], "required": true}, {"id": "c9aee9d4-ebc2-4b76-99b8-b2ced3b5e8f8", "type": "checkbox", "label": "Contact Sheet of cropped panels printed using Adobe Bridge", "options": [], "required": true}, {"id": "8389b54d-bdf2-492b-8d31-37c760e8fbec", "type": "checkbox", "label": "Confirmed color consistency using Contact Sheet", "options": [], "required": true}]}]}	\N	\N	\N	t	2025-01-15 21:12:15.6	cm5yedwv100008of5qc9th6aq	Initial version
cm5yedwxh003h8of5rnifh7s0	1	cm5yedwxh003f8of540vmw3bt	{"sections": [{"id": "f4dc5f34-365c-4e3c-9ee8-70d29e2326a1", "type": "CHECKLIST", "title": "PRINT CHECKLIST", "fields": [{"id": "a1502274-3929-4668-9574-8805baf6ef4c", "type": "checkbox", "label": "CONFIRMED PRINTER IS UP TO DATE WITH PREVENTATIVE MAINTENANCE", "options": [], "required": true}, {"id": "ba71e80a-bea3-4e9d-8073-021e3815b286", "type": "checkbox", "label": "Performed a Full Print Optimization Process", "options": [], "required": true}, {"id": "d0fd77f2-6152-4823-80dd-b51fa34b2432", "type": "checkbox", "label": "Confirmed that 'space between print' settings in ONYX is .5' for standard; 2.5-3' for cut graphics using plotter", "options": [], "required": true}, {"id": "80695324-0d9f-4192-8c68-63ea8d953b09", "type": "checkbox", "label": "Confirmed that substrate in printer matches job requirements for the project", "options": [], "required": true}, {"id": "82d52b8b-b5dd-4a35-911a-2017d7853783", "type": "checkbox", "label": "Confirmed that printer has enough substrate as required for what you just loaded to print", "options": [], "required": true}, {"id": "99011b76-0885-4a8b-94db-a8654bd48caf", "type": "checkbox", "label": "Confirmed that take up roll is attached to vinyl in printer (or a plan for catching vinyl is set)", "options": [], "required": true}, {"id": "04eb397f-3d0c-485e-bfbc-7bb078972c54", "type": "checkbox", "label": "Confirmed that substrate in printer was advanced if needed for tape marks and/or damaged areas to clear the final printing area", "options": [], "required": true}, {"id": "4dbfd904-bed9-485d-a124-91e67ffaeb3c", "type": "checkbox", "label": "Confirmed that all panels being printed have been TURNED and EXPANDED to ACTUAL PRINT SIZE", "options": [], "required": true}, {"id": "1da2ff7f-1c8d-41b6-a5c8-a31897abb4be", "type": "checkbox", "label": "Confirmed wrap panels with white backgrounds have crop marks/frame to aid in cutting", "options": [], "required": true}, {"id": "6ccb9396-7d33-4549-bded-9c84387d102b", "type": "checkbox", "label": "Confirm edge clips are in proper position", "options": [], "required": true}, {"id": "3442c321-07e1-4371-92d5-0ad29556f06c", "type": "checkbox", "label": "Confirmed that if multiple PRINT CUTS jobs are being printed, 'conserve media' is NOT selected and they are printed as individual jobs with their own barcodes", "options": [], "required": true}, {"id": "88a23dea-5a06-42e0-9c67-512bb7b1011f", "type": "checkbox", "label": "Confirmed that all ink levels in printer are ready to print. MUST BE IN THE SHOP to change inks if any color is less than 10% full or a solid color is being printed", "options": [], "required": true}, {"id": "6e2d32c9-86a8-48ae-a09f-248d259d6b33", "type": "checkbox", "label": "Changed Ink Cartridges below 10%, if necessary, when setting up printer for overnight printing", "options": [], "required": true}, {"id": "ba7b7e5e-4802-4207-a7ba-f8891670faff", "type": "checkbox", "label": "Confirmed gutter is included in print MUST GET SIGN OFF TO NOT INCLUDE", "options": [], "required": true}, {"id": "0f9adfee-ec29-4f74-97ea-95858d3b79eb", "type": "checkbox", "label": "Print Test Prints: To test photo quality and colors MUST GET SIGNED; View outside", "options": [], "required": true}, {"id": "42420951-9d1d-4e89-bbad-c5c6c5421ab0", "type": "checkbox", "label": "Before photo printed for rolling wall", "options": [], "required": true}, {"id": "9c0ff7c8-f811-4edb-a3a9-b02577bfece9", "type": "checkbox", "label": "Compared Printed Color to Paint Wrap if color Paint Wrap is being used", "options": [], "required": true}, {"id": "833175d3-b9ce-4489-a200-ee1e887b0c38", "type": "checkbox", "label": "If Wrap is from a Fleet (see check box at top of page) Compared Printed Sample to Past Printed Sample/photo(s)", "options": [], "required": true}, {"id": "44b91f11-5adb-43cd-aaa8-31f3f80ec194", "type": "checkbox", "label": "Vinyl usage under 85% must be discussed", "options": [], "required": true}, {"id": "5b60c5ed-a913-410f-a231-663db3b60420", "type": "checkbox", "label": "Printer must be watched while printing first panel and checked every 10 minutes to confirm no issues occur", "options": [], "required": true}]}]}	\N	\N	\N	t	2025-01-15 21:12:15.605	cm5yedwv100008of5qc9th6aq	Initial version
cm5yedwxl003l8of5llrmbgx2	1	cm5yedwxl003j8of5ky8fev9f	{"sections": [{"id": "a95b350c-90d9-440c-8e32-d9e49a8cb56b", "type": "CHECKLIST", "title": "LAMINATION & TRIMMING CHECKLIST", "fields": [{"id": "d2075f99-3b3d-461f-a437-6bc2070c31ca", "type": "checkbox", "label": "CONFIRMED WHETHER LAMINATION IS NEEDED OR NOT, CHECK PRINT PAPERWORK", "options": [], "required": true}, {"id": "041c9a32-e82f-40cd-a52a-ad6ca6f48384", "type": "checkbox", "label": "Confirmed there is enough lamination to complete your project", "options": [], "required": true}, {"id": "68624d15-b9ef-4d67-bdb8-adf157187d96", "type": "checkbox", "label": "Load vinyl roll on proper bar depending on length of project", "options": [], "required": true}, {"id": "36cc4090-e263-46ad-9b35-3c1a2266d74e", "type": "checkbox", "label": "Attached take up real for long runs or if you are laminating alone", "options": [], "required": true}, {"id": "610226e3-ebcc-4d95-9a75-95b727ebacc6", "type": "checkbox", "label": "Reviewed panels while lamination occurs for obvious issues", "options": [], "required": true}, {"id": "c6a5de6a-73d5-4209-ae74-3aba601f4aeb", "type": "checkbox", "label": "Swiffered panels as they are being laminated to reduce lint, dirt ect.", "options": [], "required": true}, {"id": "f4b07ccb-a7cf-4219-94bd-c277b14c4170", "type": "checkbox", "label": "Confirmed panels that are laminated - if possible may need to occur during trim; CHECKLIST", "options": [], "required": true}, {"id": "1d85e982-0a6f-41fd-a8d7-6c41477e5378", "type": "checkbox", "label": "Trimmed panels leaving 5' at both ends of Print Cut files and removing excess lamination!", "options": [], "required": true}, {"id": "df54de9d-86bd-46c4-9251-3c2f5610544c", "type": "checkbox", "label": "Trim panels that need to be sewn together and compare edges to confirm color matches", "options": [], "required": true}, {"id": "cb947484-41cc-41b6-af79-3bf1833a05f8", "type": "checkbox", "label": "Confirm COMPLETE panel inventory and package/cart project for installation; CHECKLIST", "options": [], "required": true}]}]}	\N	\N	\N	t	2025-01-15 21:12:15.61	cm5yedwv100008of5qc9th6aq	Initial version
\.


--
-- Data for Name: Phase; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Phase" (id, name, description, "order", "createdAt", "updatedAt", "workflowId") FROM stdin;
cm5yedwvt000b8of5mgrgz43s	Marketing	Initial marketing and concept phase	1	2025-01-15 21:12:15.546	2025-01-15 21:12:15.546	cm5yedwvs00098of5lwopbywk
cm5yedwvy000p8of5nykwtj6o	Design	Design and approval phase	2	2025-01-15 21:12:15.55	2025-01-15 21:12:15.55	cm5yedwvs00098of5lwopbywk
cm5yedww7001d8of5v3g5sj43	Production	Production and materials phase	3	2025-01-15 21:12:15.56	2025-01-15 21:12:15.56	cm5yedwvs00098of5lwopbywk
cm5yedwwa00218of5fif18dpq	Prep	Vehicle preparation phase	4	2025-01-15 21:12:15.563	2025-01-15 21:12:15.563	cm5yedwvs00098of5lwopbywk
cm5yedwwc002b8of5kzbp2129	Body Work	Vehicle body work phase	5	2025-01-15 21:12:15.564	2025-01-15 21:12:15.564	cm5yedwvs00098of5lwopbywk
cm5yedwwp002l8of5jn38t0q2	Paint	Vehicle painting phase	6	2025-01-15 21:12:15.577	2025-01-15 21:12:15.577	cm5yedwvs00098of5lwopbywk
cm5yeqw4l00018oy8a5malv6m	Planning	Initial planning and design phase	1	2025-01-15 21:22:21.093	2025-01-15 21:22:21.093	vehicle-wrap-workflow
cm5yeqw4l00048oy82m0olldy	Production	Vehicle wrap production phase	2	2025-01-15 21:22:21.093	2025-01-15 21:22:21.093	vehicle-wrap-workflow
cm5yeqw4l00078oy893toy8aa	Quality Control	Final inspection and client approval	3	2025-01-15 21:22:21.093	2025-01-15 21:22:21.093	vehicle-wrap-workflow
cm5yeqw51000a8oy8q27o4e4x	Design	Design and planning phase	1	2025-01-15 21:22:21.109	2025-01-15 21:22:21.109	sign-workflow
cm5yeqw51000c8oy8doea2090	Production	Sign production phase	2	2025-01-15 21:22:21.109	2025-01-15 21:22:21.109	sign-workflow
cm5yeqw51000f8oy82g2jux4q	Installation	Sign installation phase	3	2025-01-15 21:22:21.109	2025-01-15 21:22:21.109	sign-workflow
cm5yf25cj000i8o90i5wi0mq4	Design	Design and planning phase	1	2025-01-15 21:31:06.259	2025-01-15 21:31:06.259	mural-workflow
cm5yf25cj000m8o90t4mpcqft	Preparation	Surface preparation phase	2	2025-01-15 21:31:06.259	2025-01-15 21:31:06.259	mural-workflow
cm5yf25cj000p8o90dzwv7rqj	Painting	Mural painting phase	3	2025-01-15 21:31:06.259	2025-01-15 21:31:06.259	mural-workflow
cm5yf25cj000t8o90exwy9edw	Completion	Project completion phase	4	2025-01-15 21:31:06.259	2025-01-15 21:31:06.259	mural-workflow
\.


--
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Project" (id, name, description, status, "startDate", "endDate", "createdAt", "updatedAt", "workflowId", "managerId", "customerName", "projectType", "vinNumber") FROM stdin;
cm5yekplx00018or6qbcefycc	test	test	PLANNING	2025-01-15 21:17:13.458	2025-01-25 05:00:00	2025-01-15 21:17:32.709	2025-01-15 21:17:32.709	cm5yedwvs00098of5lwopbywk	cm5yedwv100008of5qc9th6aq	test	VEHICLE_WRAP	test
cm5yfgsdu00018o3o9mvtb20r	test2	test2	PLANNING	2025-01-15 21:42:01.525	2025-01-17 05:00:00	2025-01-15 21:42:29.298	2025-01-15 21:42:29.298	vehicle-wrap-workflow	cm5yedwv100008of5qc9th6aq	test2	VEHICLE_WRAP	test2
cm5zg7tv400018oi3q4010yzz	test3	test3	PLANNING	2025-01-16 14:50:58.098	2025-02-01 05:00:00	2025-01-16 14:51:17.104	2025-01-16 14:51:17.104	vehicle-wrap-workflow	cm5yedwv100008of5qc9th6aq	test3	VEHICLE_WRAP	test3
\.


--
-- Data for Name: ProjectPhase; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProjectPhase" (id, name, description, "order", status, "startDate", "endDate", "createdAt", "updatedAt", "projectId", "phaseId") FROM stdin;
cm5yekpmo00038or6lun95em5	Marketing	Initial marketing and concept phase	1	NOT_STARTED	\N	\N	2025-01-15 21:17:32.736	2025-01-15 21:17:32.736	cm5yekplx00018or6qbcefycc	cm5yedwvt000b8of5mgrgz43s
cm5yekpnh000h8or62zilk02m	Design	Design and approval phase	2	NOT_STARTED	\N	\N	2025-01-15 21:17:32.766	2025-01-15 21:17:32.766	cm5yekplx00018or6qbcefycc	cm5yedwvy000p8of5nykwtj6o
cm5yekpno00158or6lyzadli1	Production	Production and materials phase	3	NOT_STARTED	\N	\N	2025-01-15 21:17:32.772	2025-01-15 21:17:32.772	cm5yekplx00018or6qbcefycc	cm5yedww7001d8of5v3g5sj43
cm5yekpnu001t8or6y3nuhq4d	Prep	Vehicle preparation phase	4	NOT_STARTED	\N	\N	2025-01-15 21:17:32.778	2025-01-15 21:17:32.778	cm5yekplx00018or6qbcefycc	cm5yedwwa00218of5fif18dpq
cm5yekpnx00238or6z1aehzme	Body Work	Vehicle body work phase	5	NOT_STARTED	\N	\N	2025-01-15 21:17:32.781	2025-01-15 21:17:32.781	cm5yekplx00018or6qbcefycc	cm5yedwwc002b8of5kzbp2129
cm5yekpo1002d8or6eyy9t0ma	Paint	Vehicle painting phase	6	NOT_STARTED	\N	\N	2025-01-15 21:17:32.785	2025-01-15 21:17:32.785	cm5yekplx00018or6qbcefycc	cm5yedwwp002l8of5jn38t0q2
cm5yfgse700038o3o2z8zfsyz	Planning	Initial planning and design phase	1	NOT_STARTED	\N	\N	2025-01-15 21:42:29.311	2025-01-15 21:42:29.311	cm5yfgsdu00018o3o9mvtb20r	cm5yeqw4l00018oy8a5malv6m
cm5yfgsee00098o3obwafx2uq	Production	Vehicle wrap production phase	2	NOT_STARTED	\N	\N	2025-01-15 21:42:29.318	2025-01-15 21:42:29.318	cm5yfgsdu00018o3o9mvtb20r	cm5yeqw4l00048oy82m0olldy
cm5yfgseg000f8o3oura6o8w1	Quality Control	Final inspection and client approval	3	NOT_STARTED	\N	\N	2025-01-15 21:42:29.32	2025-01-15 21:42:29.32	cm5yfgsdu00018o3o9mvtb20r	cm5yeqw4l00078oy893toy8aa
cm5zg7tvm00038oi3kn2c5ki3	Planning	Initial planning and design phase	1	NOT_STARTED	\N	\N	2025-01-16 14:51:17.123	2025-01-16 14:51:17.123	cm5zg7tv400018oi3q4010yzz	cm5yeqw4l00018oy8a5malv6m
cm5zg7tvt00098oi3jr0m99t8	Production	Vehicle wrap production phase	2	NOT_STARTED	\N	\N	2025-01-16 14:51:17.129	2025-01-16 14:51:17.129	cm5zg7tv400018oi3q4010yzz	cm5yeqw4l00048oy82m0olldy
cm5zg7tvv000f8oi3ww9mwr8n	Quality Control	Final inspection and client approval	3	NOT_STARTED	\N	\N	2025-01-16 14:51:17.132	2025-01-16 14:51:17.132	cm5zg7tv400018oi3q4010yzz	cm5yeqw4l00078oy893toy8aa
\.


--
-- Data for Name: ProjectTask; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProjectTask" (id, name, description, "order", "departmentId", "assignedToId", "workflowTaskId", "createdAt", "updatedAt", "projectId", "phaseId", status, priority, "actualEnd", "actualStart", "manHours", "scheduledEnd", "scheduledStart") FROM stdin;
cm5yekpmq00058or6xqmft1nd	Creative Concept Meeting	Marketing	1	\N	\N	cm5yedwvv000d8of5unjseez9	2025-01-15 21:17:32.739	2025-01-15 21:17:32.739	cm5yekplx00018or6qbcefycc	cm5yekpmo00038or6lun95em5	NOT_STARTED	MEDIUM	\N	\N	2	\N	\N
cm5yekpnc00078or64sez5gbp	Follow up Email	Marketing	2	\N	\N	cm5yedwvv000m8of5hoakgjnc	2025-01-15 21:17:32.761	2025-01-15 21:17:32.761	cm5yekplx00018or6qbcefycc	cm5yekpmo00038or6lun95em5	NOT_STARTED	MEDIUM	\N	\N	1	\N	\N
cm5yekpnd00098or6pf74jfv6	Photos & Sizing	Marketing	4	\N	\N	cm5yedwvv000n8of5wbrvhx99	2025-01-15 21:17:32.762	2025-01-15 21:17:32.762	cm5yekplx00018or6qbcefycc	cm5yekpmo00038or6lun95em5	NOT_STARTED	HIGH	\N	\N	2	\N	\N
cm5yekpne000b8or6k2b7n7vp	Rough Mock up	Marketing	3	\N	\N	cm5yedwvv000k8of532ilc4y8	2025-01-15 21:17:32.762	2025-01-15 21:17:32.762	cm5yekplx00018or6qbcefycc	cm5yekpmo00038or6lun95em5	NOT_STARTED	HIGH	\N	\N	4	\N	\N
cm5yekpne000d8or6nz3ktbzx	Physical Inspection	Marketing	5	\N	\N	cm5yedwvv000f8of5knagabcj	2025-01-15 21:17:32.763	2025-01-15 21:17:32.763	cm5yekplx00018or6qbcefycc	cm5yekpmo00038or6lun95em5	NOT_STARTED	HIGH	\N	\N	2	\N	\N
cm5yekpnh000f8or69gwptoyg	$$$ Confirm and Update Invoice	Marketing	6	\N	\N	cm5yedwvv000l8of5wj8h3vza	2025-01-15 21:17:32.765	2025-01-15 21:17:32.765	cm5yekplx00018or6qbcefycc	cm5yekpmo00038or6lun95em5	NOT_STARTED	HIGH	\N	\N	1	\N	\N
cm5yekpni000j8or6o0rk1r3y	Final Design	Graphic Design	12	\N	\N	cm5yedwvz000x8of5acwe7bm6	2025-01-15 21:17:32.766	2025-01-15 21:17:32.766	cm5yekplx00018or6qbcefycc	cm5yekpnh000h8or62zilk02m	NOT_STARTED	HIGH	\N	\N	4	\N	\N
cm5yekpni000l8or6freyqqf6	Art Direction Sign Off	Graphic Design	10	\N	\N	cm5yedwvz00118of5r5vfovq4	2025-01-15 21:17:32.767	2025-01-15 21:17:32.767	cm5yekplx00018or6qbcefycc	cm5yekpnh000h8or62zilk02m	NOT_STARTED	HIGH	\N	\N	2	\N	\N
cm5yekpnj000n8or6cafk1zjv	Customer Sign Off	Graphic Design	11	\N	\N	cm5yedwvz00138of586k506fn	2025-01-15 21:17:32.767	2025-01-15 21:17:32.767	cm5yekplx00018or6qbcefycc	cm5yekpnh000h8or62zilk02m	NOT_STARTED	HIGH	\N	\N	2	\N	\N
cm5yekpnj000p8or6isk86bmh	Start High Res Design	Graphic Design	9	\N	\N	cm5yedwvz00128of5n7jesfdj	2025-01-15 21:17:32.768	2025-01-15 21:17:32.768	cm5yekplx00018or6qbcefycc	cm5yekpnh000h8or62zilk02m	NOT_STARTED	HIGH	\N	\N	8	\N	\N
cm5yekpnk000r8or6cdarvxn2	Pre-Design Layout Meeting	Graphic Design	7	\N	\N	cm5yedwvz000r8of5kin63ygm	2025-01-15 21:17:32.768	2025-01-15 21:17:32.768	cm5yekplx00018or6qbcefycc	cm5yekpnh000h8or62zilk02m	NOT_STARTED	HIGH	\N	\N	2	\N	\N
cm5yekpnl000t8or6jnzfgwqp	Create and verify Template	Graphic Design	8	\N	\N	cm5yedwvz000t8of5m14ynpvk	2025-01-15 21:17:32.769	2025-01-15 21:17:32.769	cm5yekplx00018or6qbcefycc	cm5yekpnh000h8or62zilk02m	NOT_STARTED	HIGH	\N	\N	4	\N	\N
cm5yekpnl000v8or6envxkufp	Customer Sign Off	Graphic Design	15	\N	\N	cm5yedwvz00158of5k7exq5b1	2025-01-15 21:17:32.77	2025-01-15 21:17:32.77	cm5yekplx00018or6qbcefycc	cm5yekpnh000h8or62zilk02m	NOT_STARTED	HIGH	\N	\N	2	\N	\N
cm5yekpnm000x8or6xrm072p8	Internal Proof	Graphic Design	13	\N	\N	cm5yedwvz00108of5hasyqpc2	2025-01-15 21:17:32.77	2025-01-15 21:17:32.77	cm5yekplx00018or6qbcefycc	cm5yekpnh000h8or62zilk02m	NOT_STARTED	HIGH	\N	\N	2	\N	\N
cm5yekpnm000z8or6qmtyvl8r	$$$ Confirm Customer Deposit	Graphic Design	16	\N	\N	cm5yedww400178of5j4ax6vw3	2025-01-15 21:17:32.771	2025-01-15 21:17:32.771	cm5yekplx00018or6qbcefycc	cm5yekpnh000h8or62zilk02m	NOT_STARTED	HIGH	\N	\N	1	\N	\N
cm5yekpnn00118or6jmn4ni80	Firm Hold Schedule Installation Drop Off	Graphic Design	17	\N	\N	cm5yedww500198of5fnbsqmxi	2025-01-15 21:17:32.771	2025-01-15 21:17:32.771	cm5yekplx00018or6qbcefycc	cm5yekpnh000h8or62zilk02m	NOT_STARTED	HIGH	\N	\N	1	\N	\N
cm5yekpnn00138or68xxkiuxy	Art Direction Sign Off	Graphic Design	14	\N	\N	cm5yedww5001b8of5u4oswwxv	2025-01-15 21:17:32.772	2025-01-15 21:17:32.772	cm5yekplx00018or6qbcefycc	cm5yekpnh000h8or62zilk02m	NOT_STARTED	HIGH	\N	\N	2	\N	\N
cm5yekpno00178or6uumlk1bz	Lamination & Rough QC	Production process	25	\N	\N	cm5yedww9001s8of589py7umt	2025-01-15 21:17:32.773	2025-01-15 21:17:32.773	cm5yekplx00018or6qbcefycc	cm5yekpno00158or6lyzadli1	NOT_STARTED	HIGH	\N	\N	4	\N	\N
cm5yekpnp00198or6pfe1ksgp	Paneling	Production process	23	\N	\N	cm5yedww9001k8of5vo827aej	2025-01-15 21:17:32.773	2025-01-15 21:17:32.773	cm5yekplx00018or6qbcefycc	cm5yekpno00158or6lyzadli1	NOT_STARTED	MEDIUM	\N	\N	4	\N	\N
cm5yekpnp001b8or6lqmge5wu	Plot	Production process	27	\N	\N	cm5yedww9001w8of5f9vgj91f	2025-01-15 21:17:32.774	2025-01-15 21:17:32.774	cm5yekplx00018or6qbcefycc	cm5yekpno00158or6lyzadli1	NOT_STARTED	MEDIUM	\N	\N	2	\N	\N
cm5yekpnq001d8or606o1tue5	Project Inventory Control / QC	Production process	28	\N	\N	cm5yedww9001x8of5zien3rqa	2025-01-15 21:17:32.774	2025-01-15 21:17:32.774	cm5yekplx00018or6qbcefycc	cm5yekpno00158or6lyzadli1	NOT_STARTED	HIGH	\N	\N	2	\N	\N
cm5yekpnq001f8or6lx1f87zi	Pre Install Meeting	Production process	22	\N	\N	cm5yedww9001f8of5wvtf73sc	2025-01-15 21:17:32.775	2025-01-15 21:17:32.775	cm5yekplx00018or6qbcefycc	cm5yekpno00158or6lyzadli1	NOT_STARTED	HIGH	\N	\N	2	\N	\N
cm5yekpnr001h8or6vumslp7h	Trim & Sew	Production process	26	\N	\N	cm5yedww9001t8of5v7nnwlm9	2025-01-15 21:17:32.775	2025-01-15 21:17:32.775	cm5yekplx00018or6qbcefycc	cm5yekpno00158or6lyzadli1	NOT_STARTED	MEDIUM	\N	\N	4	\N	\N
cm5yekpnr001j8or6zao38ai0	Make Installer Sheet	Production process	19	\N	\N	cm5yedww9001o8of5chwj94fl	2025-01-15 21:17:32.776	2025-01-15 21:17:32.776	cm5yekplx00018or6qbcefycc	cm5yekpno00158or6lyzadli1	NOT_STARTED	MEDIUM	\N	\N	2	\N	\N
cm5yekpns001l8or6bkrpog0e	Print Ready Files Blue Prints and Review	Production process	20	\N	\N	cm5yedww9001l8of5sywctyg2	2025-01-15 21:17:32.776	2025-01-15 21:17:32.776	cm5yekplx00018or6qbcefycc	cm5yekpno00158or6lyzadli1	NOT_STARTED	HIGH	\N	\N	4	\N	\N
cm5yekpns001n8or6b9i8ewjn	Printing	Production process	24	\N	\N	cm5yedww9001q8of5bkm012ex	2025-01-15 21:17:32.777	2025-01-15 21:17:32.777	cm5yekplx00018or6qbcefycc	cm5yekpno00158or6lyzadli1	NOT_STARTED	HIGH	\N	\N	6	\N	\N
cm5yekpnt001p8or6zsk8bl9z	Create Test Print	Production process	21	\N	\N	cm5yedww9001n8of5kfole1zh	2025-01-15 21:17:32.777	2025-01-15 21:17:32.777	cm5yekplx00018or6qbcefycc	cm5yekpno00158or6lyzadli1	NOT_STARTED	HIGH	\N	\N	2	\N	\N
cm5yekpnt001r8or6huwn08zk	Order Raw Materials	Production process	18	\N	\N	cm5yedww9001z8of5pgddtr29	2025-01-15 21:17:32.778	2025-01-15 21:17:32.778	cm5yekplx00018or6qbcefycc	cm5yekpno00158or6lyzadli1	NOT_STARTED	HIGH	\N	\N	2	\N	\N
cm5yekpnv001v8or6zqc4u51x	Wrap Plan Set Up	Installation prep	30	\N	\N	cm5yedwwb00268of5qjn0fn8x	2025-01-15 21:17:32.779	2025-01-15 21:17:32.779	cm5yekplx00018or6qbcefycc	cm5yekpnu001t8or6y3nuhq4d	NOT_STARTED	HIGH	\N	\N	2	\N	\N
cm5yekpnv001x8or67tjii1up	Prep Clean	Installation prep	32	\N	\N	cm5yedwwb00298of5jxmqqrla	2025-01-15 21:17:32.78	2025-01-15 21:17:32.78	cm5yekplx00018or6qbcefycc	cm5yekpnu001t8or6y3nuhq4d	NOT_STARTED	HIGH	\N	\N	2	\N	\N
cm5yekpnw001z8or6uop6g69j	Intake of Item	Installation prep	29	\N	\N	cm5yedwwb00238of59n8gy2km	2025-01-15 21:17:32.78	2025-01-15 21:17:32.78	cm5yekplx00018or6qbcefycc	cm5yekpnu001t8or6y3nuhq4d	NOT_STARTED	HIGH	\N	\N	1	\N	\N
cm5yekpnw00218or6cr80e93e	Repairs & Vinyl Adhesive Removal	Installation prep	31	\N	\N	cm5yedwwb00278of5kksmxtcd	2025-01-15 21:17:32.781	2025-01-15 21:17:32.781	cm5yekplx00018or6qbcefycc	cm5yekpnu001t8or6y3nuhq4d	NOT_STARTED	HIGH	\N	\N	4	\N	\N
cm5yekpny00258or6svfafi4j	Putty	Body work process	33	\N	\N	cm5yedwwc002f8of5fpdefybb	2025-01-15 21:17:32.782	2025-01-15 21:17:32.782	cm5yekplx00018or6qbcefycc	cm5yekpnx00238or6z1aehzme	NOT_STARTED	MEDIUM	\N	\N	2	\N	\N
cm5yekpny00278or68n4nrx6w	Dent Removal	Body work process	35	\N	\N	cm5yedwwc002h8of5xz4a8lyi	2025-01-15 21:17:32.783	2025-01-15 21:17:32.783	cm5yekplx00018or6qbcefycc	cm5yekpnx00238or6z1aehzme	NOT_STARTED	HIGH	\N	\N	4	\N	\N
cm5yekpnz00298or6s9i0o3dn	Bondo	Body work process	34	\N	\N	cm5yedwwc002g8of56k31b29o	2025-01-15 21:17:32.783	2025-01-15 21:17:32.783	cm5yekplx00018or6qbcefycc	cm5yekpnx00238or6z1aehzme	NOT_STARTED	MEDIUM	\N	\N	3	\N	\N
cm5yekpnz002b8or6mncuo19d	Fabrication	Body work process	36	\N	\N	cm5yedwwc002j8of5isq8nlox	2025-01-15 21:17:32.784	2025-01-15 21:17:32.784	cm5yekplx00018or6qbcefycc	cm5yekpnx00238or6z1aehzme	NOT_STARTED	HIGH	\N	\N	6	\N	\N
cm5yekpo2002f8or6cvobffdl	Primer	Paint process	39	\N	\N	cm5yedwwp002r8of56ztu7khf	2025-01-15 21:17:32.786	2025-01-15 21:17:32.786	cm5yekplx00018or6qbcefycc	cm5yekpo1002d8or6eyy9t0ma	NOT_STARTED	HIGH	\N	\N	2	\N	\N
cm5yekpo2002h8or6sm4n61xl	Removal of Masking	Paint process	42	\N	\N	cm5yedwwp002v8of5lloano5j	2025-01-15 21:17:32.787	2025-01-15 21:17:32.787	cm5yekplx00018or6qbcefycc	cm5yekpo1002d8or6eyy9t0ma	NOT_STARTED	MEDIUM	\N	\N	1	\N	\N
cm5yekpo3002j8or6ve4cdvak	Paint	Paint process	40	\N	\N	cm5yedwwp002x8of5iweg4v1h	2025-01-15 21:17:32.787	2025-01-15 21:17:32.787	cm5yekplx00018or6qbcefycc	cm5yekpo1002d8or6eyy9t0ma	NOT_STARTED	HIGH	\N	\N	4	\N	\N
cm5yekpo3002l8or6k7yyw8ad	Surface Prep / Degrease	Paint process	37	\N	\N	cm5yedwwp002o8of5bpcdkgmv	2025-01-15 21:17:32.788	2025-01-15 21:17:32.788	cm5yekplx00018or6qbcefycc	cm5yekpo1002d8or6eyy9t0ma	NOT_STARTED	HIGH	\N	\N	2	\N	\N
cm5yekpo4002n8or6w1fcjp3i	Masking	Paint process	38	\N	\N	cm5yedwwp002p8of51wp5vaks	2025-01-15 21:17:32.788	2025-01-15 21:17:32.788	cm5yekplx00018or6qbcefycc	cm5yekpo1002d8or6eyy9t0ma	NOT_STARTED	MEDIUM	\N	\N	2	\N	\N
cm5yekpo4002p8or6z1jqgle8	Specialty Paint/ Texture/ Bedliner	Paint process	41	\N	\N	cm5yedwwp002w8of5ezfb2ps7	2025-01-15 21:17:32.789	2025-01-15 21:17:32.789	cm5yekplx00018or6qbcefycc	cm5yekpo1002d8or6eyy9t0ma	NOT_STARTED	HIGH	\N	\N	4	\N	\N
cm5yfgse900058o3ojr6tlrul	Initial Consultation	Meet with client to discuss requirements	1	\N	\N	cm5yeqw4l00028oy82yyuc6db	2025-01-15 21:42:29.313	2025-01-15 21:42:29.313	cm5yfgsdu00018o3o9mvtb20r	cm5yfgse700038o3o2z8zfsyz	NOT_STARTED	HIGH	\N	\N	2	\N	\N
cm5yfgsed00078o3opal7ub0r	Design Approval	Get client approval on design	2	\N	\N	cm5yeqw4l00038oy8pddhsvb7	2025-01-15 21:42:29.317	2025-01-15 21:42:29.317	cm5yfgsdu00018o3o9mvtb20r	cm5yfgse700038o3o2z8zfsyz	NOT_STARTED	HIGH	\N	\N	4	\N	\N
cm5yfgsee000b8o3oe4puva2i	Material Preparation	Prepare wrap materials	1	\N	\N	cm5yeqw4l00058oy8clwo6u58	2025-01-15 21:42:29.319	2025-01-15 21:42:29.319	cm5yfgsdu00018o3o9mvtb20r	cm5yfgsee00098o3obwafx2uq	NOT_STARTED	MEDIUM	\N	\N	4	\N	\N
cm5yfgsef000d8o3obg6elqe5	Installation	Install vehicle wrap	2	\N	\N	cm5yeqw4l00068oy8seicynqu	2025-01-15 21:42:29.319	2025-01-15 21:42:29.319	cm5yfgsdu00018o3o9mvtb20r	cm5yfgsee00098o3obwafx2uq	NOT_STARTED	HIGH	\N	\N	8	\N	\N
cm5yfgseg000h8o3oxkmpqrx6	Final Inspection	Quality check of installed wrap	1	\N	\N	cm5yeqw4l00088oy8qf1kejhx	2025-01-15 21:42:29.321	2025-01-15 21:42:29.321	cm5yfgsdu00018o3o9mvtb20r	cm5yfgseg000f8o3oura6o8w1	NOT_STARTED	HIGH	\N	\N	2	\N	\N
cm5yfgseh000j8o3oip2z6k19	Client Approval	Get final client sign-off	2	\N	\N	cm5yeqw4l00098oy8wp3t8mpb	2025-01-15 21:42:29.322	2025-01-15 21:42:29.322	cm5yfgsdu00018o3o9mvtb20r	cm5yfgseg000f8o3oura6o8w1	NOT_STARTED	HIGH	\N	\N	1	\N	\N
cm5zg7tvo00058oi36knjlm7p	Initial Consultation	Meet with client to discuss requirements	1	\N	\N	cm5yeqw4l00028oy82yyuc6db	2025-01-16 14:51:17.125	2025-01-16 14:51:17.125	cm5zg7tv400018oi3q4010yzz	cm5zg7tvm00038oi3kn2c5ki3	NOT_STARTED	HIGH	\N	\N	2	\N	\N
cm5zg7tvs00078oi3td5rnn7c	Design Approval	Get client approval on design	2	\N	\N	cm5yeqw4l00038oy8pddhsvb7	2025-01-16 14:51:17.128	2025-01-16 14:51:17.128	cm5zg7tv400018oi3q4010yzz	cm5zg7tvm00038oi3kn2c5ki3	NOT_STARTED	HIGH	\N	\N	4	\N	\N
cm5zg7tvu000b8oi3md8is53f	Material Preparation	Prepare wrap materials	1	\N	\N	cm5yeqw4l00058oy8clwo6u58	2025-01-16 14:51:17.13	2025-01-16 14:51:17.13	cm5zg7tv400018oi3q4010yzz	cm5zg7tvt00098oi3jr0m99t8	NOT_STARTED	MEDIUM	\N	\N	4	\N	\N
cm5zg7tvu000d8oi3sbj6krcy	Installation	Install vehicle wrap	2	\N	\N	cm5yeqw4l00068oy8seicynqu	2025-01-16 14:51:17.131	2025-01-16 14:51:17.131	cm5zg7tv400018oi3q4010yzz	cm5zg7tvt00098oi3jr0m99t8	NOT_STARTED	HIGH	\N	\N	8	\N	\N
cm5zg7tvw000h8oi3z36bk0cp	Final Inspection	Quality check of installed wrap	1	\N	\N	cm5yeqw4l00088oy8qf1kejhx	2025-01-16 14:51:17.132	2025-01-16 14:51:17.132	cm5zg7tv400018oi3q4010yzz	cm5zg7tvv000f8oi3ww9mwr8n	NOT_STARTED	HIGH	\N	\N	2	\N	\N
cm5zg7tvx000j8oi37x6u196j	Client Approval	Get final client sign-off	2	\N	\N	cm5yeqw4l00098oy8wp3t8mpb	2025-01-16 14:51:17.133	2025-01-16 14:51:17.133	cm5zg7tv400018oi3q4010yzz	cm5zg7tvv000f8oi3ww9mwr8n	NOT_STARTED	HIGH	\N	\N	1	\N	\N
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: TaskActivity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TaskActivity" (id, "taskId", "userId", type, "createdAt", details) FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, "emailVerified", image, role, "hashedPassword", "createdAt", "updatedAt") FROM stdin;
cm5yedwv100008of5qc9th6aq	admin	admin@example.com	\N	\N	ADMIN	$2a$10$7IPy/x1257HuONA4WzYLWe3XV64fM.Ex1N25DLBYQ.8v4x6T/YA5G	2025-01-15 21:12:15.518	2025-01-15 21:12:15.518
\.


--
-- Data for Name: UserPreference; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserPreference" (id, "userId", theme, notifications, dashboard, "taskView", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: Workflow; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Workflow" (id, name, description, "createdAt", "updatedAt") FROM stdin;
cm5yedwvs00098of5lwopbywk	Vehicle Wrap Workflow	Standard workflow for vehicle wrap projects	2025-01-15 21:12:15.545	2025-01-15 21:12:15.545
vehicle-wrap-workflow	Vehicle Wrap Standard	Standard workflow for vehicle wrap projects	2025-01-15 21:22:21.093	2025-01-15 21:22:21.093
sign-workflow	Sign Project Standard	Standard workflow for sign projects	2025-01-15 21:22:21.109	2025-01-15 21:22:21.109
mural-workflow	Mural Project Standard	Standard workflow for mural projects	2025-01-15 21:31:06.259	2025-01-15 21:31:06.259
\.


--
-- Data for Name: WorkflowTask; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WorkflowTask" (id, name, description, priority, "manHours", "order", "createdAt", "updatedAt", "phaseId", "departmentId") FROM stdin;
cm5yedwvv000d8of5unjseez9	Creative Concept Meeting	Marketing	MEDIUM	2	1	2025-01-15 21:12:15.547	2025-01-15 21:12:15.547	cm5yedwvt000b8of5mgrgz43s	\N
cm5yedwvv000m8of5hoakgjnc	Follow up Email	Marketing	MEDIUM	1	2	2025-01-15 21:12:15.547	2025-01-15 21:12:15.547	cm5yedwvt000b8of5mgrgz43s	\N
cm5yedwvv000n8of5wbrvhx99	Photos & Sizing	Marketing	HIGH	2	4	2025-01-15 21:12:15.547	2025-01-15 21:12:15.547	cm5yedwvt000b8of5mgrgz43s	\N
cm5yedwvv000k8of532ilc4y8	Rough Mock up	Marketing	HIGH	4	3	2025-01-15 21:12:15.547	2025-01-15 21:12:15.547	cm5yedwvt000b8of5mgrgz43s	\N
cm5yedwvz000x8of5acwe7bm6	Final Design	Graphic Design	HIGH	4	12	2025-01-15 21:12:15.552	2025-01-15 21:12:15.552	cm5yedwvy000p8of5nykwtj6o	\N
cm5yedwvz00118of5r5vfovq4	Art Direction Sign Off	Graphic Design	HIGH	2	10	2025-01-15 21:12:15.552	2025-01-15 21:12:15.552	cm5yedwvy000p8of5nykwtj6o	\N
cm5yedwvz00138of586k506fn	Customer Sign Off	Graphic Design	HIGH	2	11	2025-01-15 21:12:15.552	2025-01-15 21:12:15.552	cm5yedwvy000p8of5nykwtj6o	\N
cm5yedwvz00128of5n7jesfdj	Start High Res Design	Graphic Design	HIGH	8	9	2025-01-15 21:12:15.552	2025-01-15 21:12:15.552	cm5yedwvy000p8of5nykwtj6o	\N
cm5yedww9001s8of589py7umt	Lamination & Rough QC	Production process	HIGH	4	25	2025-01-15 21:12:15.561	2025-01-15 21:12:15.561	cm5yedww7001d8of5v3g5sj43	\N
cm5yedww9001k8of5vo827aej	Paneling	Production process	MEDIUM	4	23	2025-01-15 21:12:15.561	2025-01-15 21:12:15.561	cm5yedww7001d8of5v3g5sj43	\N
cm5yedww9001w8of5f9vgj91f	Plot	Production process	MEDIUM	2	27	2025-01-15 21:12:15.561	2025-01-15 21:12:15.561	cm5yedww7001d8of5v3g5sj43	\N
cm5yedww9001x8of5zien3rqa	Project Inventory Control / QC	Production process	HIGH	2	28	2025-01-15 21:12:15.561	2025-01-15 21:12:15.561	cm5yedww7001d8of5v3g5sj43	\N
cm5yedwwb00268of5qjn0fn8x	Wrap Plan Set Up	Installation prep	HIGH	2	30	2025-01-15 21:12:15.563	2025-01-15 21:12:15.563	cm5yedwwa00218of5fif18dpq	\N
cm5yedwwb00298of5jxmqqrla	Prep Clean	Installation prep	HIGH	2	32	2025-01-15 21:12:15.564	2025-01-15 21:12:15.564	cm5yedwwa00218of5fif18dpq	\N
cm5yedwwc002f8of5fpdefybb	Putty	Body work process	MEDIUM	2	33	2025-01-15 21:12:15.565	2025-01-15 21:12:15.565	cm5yedwwc002b8of5kzbp2129	\N
cm5yedwwc002h8of5xz4a8lyi	Dent Removal	Body work process	HIGH	4	35	2025-01-15 21:12:15.565	2025-01-15 21:12:15.565	cm5yedwwc002b8of5kzbp2129	\N
cm5yedwwp002r8of56ztu7khf	Primer	Paint process	HIGH	2	39	2025-01-15 21:12:15.578	2025-01-15 21:12:15.578	cm5yedwwp002l8of5jn38t0q2	\N
cm5yedwwp002v8of5lloano5j	Removal of Masking	Paint process	MEDIUM	1	42	2025-01-15 21:12:15.578	2025-01-15 21:12:15.578	cm5yedwwp002l8of5jn38t0q2	\N
cm5yedwwp002x8of5iweg4v1h	Paint	Paint process	HIGH	4	40	2025-01-15 21:12:15.578	2025-01-15 21:12:15.578	cm5yedwwp002l8of5jn38t0q2	\N
cm5yedwvv000f8of5knagabcj	Physical Inspection	Marketing	HIGH	2	5	2025-01-15 21:12:15.547	2025-01-15 21:12:15.547	cm5yedwvt000b8of5mgrgz43s	\N
cm5yedwvv000l8of5wj8h3vza	$$$ Confirm and Update Invoice	Marketing	HIGH	1	6	2025-01-15 21:12:15.547	2025-01-15 21:12:15.547	cm5yedwvt000b8of5mgrgz43s	\N
cm5yedwvz000r8of5kin63ygm	Pre-Design Layout Meeting	Graphic Design	HIGH	2	7	2025-01-15 21:12:15.552	2025-01-15 21:12:15.552	cm5yedwvy000p8of5nykwtj6o	\N
cm5yedwvz000t8of5m14ynpvk	Create and verify Template	Graphic Design	HIGH	4	8	2025-01-15 21:12:15.552	2025-01-15 21:12:15.552	cm5yedwvy000p8of5nykwtj6o	\N
cm5yedwvz00158of5k7exq5b1	Customer Sign Off	Graphic Design	HIGH	2	15	2025-01-15 21:12:15.552	2025-01-15 21:12:15.552	cm5yedwvy000p8of5nykwtj6o	\N
cm5yedwvz00108of5hasyqpc2	Internal Proof	Graphic Design	HIGH	2	13	2025-01-15 21:12:15.552	2025-01-15 21:12:15.552	cm5yedwvy000p8of5nykwtj6o	\N
cm5yedww400178of5j4ax6vw3	$$$ Confirm Customer Deposit	Graphic Design	HIGH	1	16	2025-01-15 21:12:15.552	2025-01-15 21:12:15.552	cm5yedwvy000p8of5nykwtj6o	\N
cm5yedww500198of5fnbsqmxi	Firm Hold Schedule Installation Drop Off	Graphic Design	HIGH	1	17	2025-01-15 21:12:15.552	2025-01-15 21:12:15.552	cm5yedwvy000p8of5nykwtj6o	\N
cm5yedww5001b8of5u4oswwxv	Art Direction Sign Off	Graphic Design	HIGH	2	14	2025-01-15 21:12:15.552	2025-01-15 21:12:15.552	cm5yedwvy000p8of5nykwtj6o	\N
cm5yedww9001f8of5wvtf73sc	Pre Install Meeting	Production process	HIGH	2	22	2025-01-15 21:12:15.561	2025-01-15 21:12:15.561	cm5yedww7001d8of5v3g5sj43	\N
cm5yedww9001t8of5v7nnwlm9	Trim & Sew	Production process	MEDIUM	4	26	2025-01-15 21:12:15.561	2025-01-15 21:12:15.561	cm5yedww7001d8of5v3g5sj43	\N
cm5yedww9001o8of5chwj94fl	Make Installer Sheet	Production process	MEDIUM	2	19	2025-01-15 21:12:15.561	2025-01-15 21:12:15.561	cm5yedww7001d8of5v3g5sj43	\N
cm5yedww9001l8of5sywctyg2	Print Ready Files Blue Prints and Review	Production process	HIGH	4	20	2025-01-15 21:12:15.561	2025-01-15 21:12:15.561	cm5yedww7001d8of5v3g5sj43	\N
cm5yedww9001q8of5bkm012ex	Printing	Production process	HIGH	6	24	2025-01-15 21:12:15.561	2025-01-15 21:12:15.561	cm5yedww7001d8of5v3g5sj43	\N
cm5yedww9001n8of5kfole1zh	Create Test Print	Production process	HIGH	2	21	2025-01-15 21:12:15.561	2025-01-15 21:12:15.561	cm5yedww7001d8of5v3g5sj43	\N
cm5yedww9001z8of5pgddtr29	Order Raw Materials	Production process	HIGH	2	18	2025-01-15 21:12:15.561	2025-01-15 21:12:15.561	cm5yedww7001d8of5v3g5sj43	\N
cm5yedwwb00238of59n8gy2km	Intake of Item	Installation prep	HIGH	1	29	2025-01-15 21:12:15.563	2025-01-15 21:12:15.563	cm5yedwwa00218of5fif18dpq	\N
cm5yedwwb00278of5kksmxtcd	Repairs & Vinyl Adhesive Removal	Installation prep	HIGH	4	31	2025-01-15 21:12:15.563	2025-01-15 21:12:15.563	cm5yedwwa00218of5fif18dpq	\N
cm5yedwwc002g8of56k31b29o	Bondo	Body work process	MEDIUM	3	34	2025-01-15 21:12:15.565	2025-01-15 21:12:15.565	cm5yedwwc002b8of5kzbp2129	\N
cm5yedwwc002j8of5isq8nlox	Fabrication	Body work process	HIGH	6	36	2025-01-15 21:12:15.565	2025-01-15 21:12:15.565	cm5yedwwc002b8of5kzbp2129	\N
cm5yedwwp002o8of5bpcdkgmv	Surface Prep / Degrease	Paint process	HIGH	2	37	2025-01-15 21:12:15.578	2025-01-15 21:12:15.578	cm5yedwwp002l8of5jn38t0q2	\N
cm5yedwwp002p8of51wp5vaks	Masking	Paint process	MEDIUM	2	38	2025-01-15 21:12:15.578	2025-01-15 21:12:15.578	cm5yedwwp002l8of5jn38t0q2	\N
cm5yedwwp002w8of5ezfb2ps7	Specialty Paint/ Texture/ Bedliner	Paint process	HIGH	4	41	2025-01-15 21:12:15.578	2025-01-15 21:12:15.578	cm5yedwwp002l8of5jn38t0q2	\N
cm5yeqw4l00028oy82yyuc6db	Initial Consultation	Meet with client to discuss requirements	HIGH	2	1	2025-01-15 21:22:21.093	2025-01-15 21:22:21.093	cm5yeqw4l00018oy8a5malv6m	\N
cm5yeqw4l00038oy8pddhsvb7	Design Approval	Get client approval on design	HIGH	4	2	2025-01-15 21:22:21.093	2025-01-15 21:22:21.093	cm5yeqw4l00018oy8a5malv6m	\N
cm5yeqw4l00058oy8clwo6u58	Material Preparation	Prepare wrap materials	MEDIUM	4	1	2025-01-15 21:22:21.093	2025-01-15 21:22:21.093	cm5yeqw4l00048oy82m0olldy	\N
cm5yeqw4l00068oy8seicynqu	Installation	Install vehicle wrap	HIGH	8	2	2025-01-15 21:22:21.093	2025-01-15 21:22:21.093	cm5yeqw4l00048oy82m0olldy	\N
cm5yeqw4l00088oy8qf1kejhx	Final Inspection	Quality check of installed wrap	HIGH	2	1	2025-01-15 21:22:21.093	2025-01-15 21:22:21.093	cm5yeqw4l00078oy893toy8aa	\N
cm5yeqw4l00098oy8wp3t8mpb	Client Approval	Get final client sign-off	HIGH	1	2	2025-01-15 21:22:21.093	2025-01-15 21:22:21.093	cm5yeqw4l00078oy893toy8aa	\N
cm5yeqw51000b8oy8jkujpbl6	Design Creation	Create initial design	HIGH	4	1	2025-01-15 21:22:21.109	2025-01-15 21:22:21.109	cm5yeqw51000a8oy8q27o4e4x	\N
cm5yeqw51000d8oy8x4k8cnev	Material Selection	Select and order materials	MEDIUM	2	1	2025-01-15 21:22:21.109	2025-01-15 21:22:21.109	cm5yeqw51000c8oy8doea2090	\N
cm5yeqw51000e8oy82cy419ob	Fabrication	Fabricate the sign	HIGH	8	2	2025-01-15 21:22:21.109	2025-01-15 21:22:21.109	cm5yeqw51000c8oy8doea2090	\N
cm5yeqw51000g8oy8hsgf9hvd	Site Preparation	Prepare installation site	MEDIUM	4	1	2025-01-15 21:22:21.109	2025-01-15 21:22:21.109	cm5yeqw51000f8oy82g2jux4q	\N
cm5yeqw51000h8oy8es2527jk	Installation	Install the sign	HIGH	6	2	2025-01-15 21:22:21.109	2025-01-15 21:22:21.109	cm5yeqw51000f8oy82g2jux4q	\N
cm5yf25cj000j8o90j3m18a3b	Site Survey	Survey the mural location	HIGH	2	1	2025-01-15 21:31:06.259	2025-01-15 21:31:06.259	cm5yf25cj000i8o90i5wi0mq4	\N
cm5yf25cj000k8o90xee3qk0k	Design Creation	Create mural design	HIGH	8	2	2025-01-15 21:31:06.259	2025-01-15 21:31:06.259	cm5yf25cj000i8o90i5wi0mq4	\N
cm5yf25cj000l8o90atcw5nyc	Client Approval	Get client approval on design	HIGH	2	3	2025-01-15 21:31:06.259	2025-01-15 21:31:06.259	cm5yf25cj000i8o90i5wi0mq4	\N
cm5yf25cj000n8o907xmn3eqz	Surface Cleaning	Clean and prepare the surface	HIGH	4	1	2025-01-15 21:31:06.259	2025-01-15 21:31:06.259	cm5yf25cj000m8o90t4mpcqft	\N
cm5yf25cj000o8o90dq7422mb	Priming	Prime the surface	HIGH	4	2	2025-01-15 21:31:06.259	2025-01-15 21:31:06.259	cm5yf25cj000m8o90t4mpcqft	\N
cm5yf25cj000q8o90xilxaka8	Base Colors	Apply base colors	HIGH	8	1	2025-01-15 21:31:06.259	2025-01-15 21:31:06.259	cm5yf25cj000p8o90dzwv7rqj	\N
cm5yf25cj000r8o90rl2y785t	Details	Paint detailed elements	HIGH	16	2	2025-01-15 21:31:06.259	2025-01-15 21:31:06.259	cm5yf25cj000p8o90dzwv7rqj	\N
cm5yf25cj000s8o90ud3doeho	Final Touches	Add finishing touches	MEDIUM	4	3	2025-01-15 21:31:06.259	2025-01-15 21:31:06.259	cm5yf25cj000p8o90dzwv7rqj	\N
cm5yf25cj000u8o90lqth67si	Quality Check	Final quality inspection	HIGH	2	1	2025-01-15 21:31:06.259	2025-01-15 21:31:06.259	cm5yf25cj000t8o90exwy9edw	\N
cm5yf25cj000v8o90n1tvqnti	Protective Coating	Apply protective coating	HIGH	4	2	2025-01-15 21:31:06.259	2025-01-15 21:31:06.259	cm5yf25cj000t8o90exwy9edw	\N
cm5yf25cj000w8o9027knj7bc	Client Sign-off	Get final client approval	HIGH	1	3	2025-01-15 21:31:06.259	2025-01-15 21:31:06.259	cm5yf25cj000t8o90exwy9edw	\N
\.


--
-- Data for Name: _FormDependencies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_FormDependencies" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _UserDepartments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_UserDepartments" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
f6d04c31-b1b8-4315-98ef-b9f894702282	e49c0c8289dd489e89464285b079cfdb35ad1c8adab45fd8051ea065fa095a10	2025-01-15 16:12:13.608684-05	20250104180840_init	\N	\N	2025-01-15 16:12:13.593617-05	1
6d13fd37-012e-4c09-bfb0-47fc20f898c4	8cfeb3546f70ac38947c5e459d58e1a8728df2bf5f666905b80fbd39206dca3e	2025-01-15 16:12:13.707162-05	20250108221646_add_form_status_tracking	\N	\N	2025-01-15 16:12:13.701787-05	1
fafc54d8-4bfe-4945-b50d-35cd11d17049	4658c7140fd91c528a6d05f9629625d683125d0e87c89eb8b66f2d3ce7014b98	2025-01-15 16:12:13.615922-05	20250104191959_make_username_unique	\N	\N	2025-01-15 16:12:13.609218-05	1
76c6097d-275f-43bf-9085-60fdb3afa87a	963d7477e3115809efa34fd9f73746cc8ace1f10ffb3a672f14839b6308fe037	2025-01-15 16:12:13.617936-05	20250104192809_remove_email_field	\N	\N	2025-01-15 16:12:13.616475-05	1
ce6cabaf-8cbe-49fb-80b0-8537942e55fc	57e9d6ab285eab2eb95d8b560698e42751b0d2d5e61f21569734b720f9a3c574	2025-01-15 16:12:13.624268-05	20250104231516_migration1	\N	\N	2025-01-15 16:12:13.618336-05	1
8347a126-e8d4-405a-8f10-18773bc0c97d	573b4c1336c015e95d7e96347f3d1fa09cd3b48035316e51066141e98540025e	2025-01-15 16:12:13.708022-05	20250109191146_remove_form_template_type	\N	\N	2025-01-15 16:12:13.707414-05	1
ece47257-9363-4623-a2c1-23e7afe01730	9d6e8625dbe3e128ac50cb9fe9327531c0d38a84ce48529897c1d5b15140cf21	2025-01-15 16:12:13.640505-05	20250105135047_add_department_model	\N	\N	2025-01-15 16:12:13.624907-05	1
76c9a0d2-563a-48fd-b6b3-79b36689adff	e0fa2f7be6c1ab2e72a0ac2ed9359be08363a52b8d5eddfe5ebf2e724abbb8aa	2025-01-15 16:12:13.658106-05	20250105143131_add_task_dependencies_and_preferences	\N	\N	2025-01-15 16:12:13.642278-05	1
0b37860c-caff-4d20-a896-8c6e86dac975	68f1dcfe123928c0dc3cc01321b3b2f63a4f5c0fbcaa205360e3727d090db268	2025-01-15 16:12:13.66552-05	20250105175509_add_project_and_form_models	\N	\N	2025-01-15 16:12:13.660089-05	1
fe4677ba-1614-48c7-9a0d-58d6cde345a3	85d6f6ad341e3f460e1a068e6d1302c64d71a26a7d18431a6933f858f2084975	2025-01-15 16:12:13.709898-05	20250115155318_add_project_types	\N	\N	2025-01-15 16:12:13.708962-05	1
8a355648-96be-4ba4-9a9d-9d9538a4b289	9d0b2ceca87ffe3ea8a5c129bcfb424cb6cf830f0cbca718ded83edc03cbc8cd	2025-01-15 16:12:13.668875-05	20250105192144_add_user_password	\N	\N	2025-01-15 16:12:13.666123-05	1
306c103b-d98e-403a-acca-c53882e31ad1	d80d6c8b3cc0a0c922ea208a69f0317b7b0030b0711924e94f2bb9a04a3a2dba	2025-01-15 16:12:13.673582-05	20250106131119_update_user_and_project_models	\N	\N	2025-01-15 16:12:13.669312-05	1
61cc9958-02f2-4480-8a9e-a0a63eda71b2	53d3922947e9fbce155f44e1c7088c3739d4becec0aea37e4bb190aa9685df47	2025-01-15 16:12:13.675565-05	20250106151740_add_form_priority_and_status	\N	\N	2025-01-15 16:12:13.674167-05	1
41a2ee8b-0f27-410d-9e86-4e31c3d587e7	b5f4a96bf04a7e9bbbae793c92c539bba830fb70cbb75f0ab774421fd5e00a2e	2025-01-15 16:12:13.715915-05	20250115183450_add_task_activity	\N	\N	2025-01-15 16:12:13.710257-05	1
f854ea7c-d200-4a0d-93ac-6262bb2dbeca	fff27e4b62b3977de4a8a884e2e72d5f6853516f5c5c68930951b70171a19f83	2025-01-15 16:12:13.697061-05	20250106203851_add_form_version_fields	\N	\N	2025-01-15 16:12:13.675952-05	1
11369e66-e815-4bac-a3ce-a2dfff04fb1e	41b1bb0c590897a853691ab832eccc2e3a1fe46a5de86792bf4a26235cce9062	2025-01-15 16:12:13.700237-05	20250108142649_add_workflow_to_form_template	\N	\N	2025-01-15 16:12:13.697634-05	1
f535b572-edec-47db-bf89-2931500c86a2	aee06918309fe74e39c9863980a8205ca492356faf36fd12aeffb4c204bd735a	2025-01-15 16:12:13.701483-05	20250108162135_remove_form_template_priority	\N	\N	2025-01-15 16:12:13.700648-05	1
c7ae0e61-20ad-41ae-8b1f-67b7867e9993	dca8940add97f3bac8cb0da66c55c0e5e6ddecbf94466b455bc18eda744c46c4	2025-01-15 16:12:13.716985-05	20250115184028_20250115_projects	\N	\N	2025-01-15 16:12:13.716258-05	1
084bc1ea-29c3-4699-880f-8107e54527a0	7ea4da205a184e8be95ab68077ef6e29d1afe6dcf525dae34ca8c45fd7b1f3fd	2025-01-15 16:12:13.724302-05	20250115203633_update_task_schema	\N	\N	2025-01-15 16:12:13.717376-05	1
d84d3b99-b11d-4c2b-b3e7-07de36aa8f8b	75d2b1b12689ff1298c709cb7e5f107b6703dba5ce6cefc4ecb204d2d6933ac1	2025-01-15 16:12:13.72641-05	20250115204444_20250115_2	\N	\N	2025-01-15 16:12:13.72471-05	1
c103739f-589b-420b-bdd3-86927601db9e	7d8e8cc67d4767772454068afc72a42bcfe517dfa742d95e6d7905602155872a	2025-01-15 16:12:13.728051-05	20250115205740_add_task_scheduling_fields	\N	\N	2025-01-15 16:12:13.726767-05	1
fb4c3356-92c3-4385-b7b2-7341fdd38cae	f64dd4d66f4f4aa6de0cf0d28e698fd56f9583a659c4926e6f49e2bb933f69ce	\N	20250116212123_update_schema_types	\N	\N	2025-01-16 16:21:23.280572-05	0
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Department Department_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Department"
    ADD CONSTRAINT "Department_pkey" PRIMARY KEY (id);


--
-- Name: FormCompletionRequirement FormCompletionRequirement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormCompletionRequirement"
    ADD CONSTRAINT "FormCompletionRequirement_pkey" PRIMARY KEY (id);


--
-- Name: FormInstance FormInstance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormInstance"
    ADD CONSTRAINT "FormInstance_pkey" PRIMARY KEY (id);


--
-- Name: FormResponseHistory FormResponseHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormResponseHistory"
    ADD CONSTRAINT "FormResponseHistory_pkey" PRIMARY KEY (id);


--
-- Name: FormResponse FormResponse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormResponse"
    ADD CONSTRAINT "FormResponse_pkey" PRIMARY KEY (id);


--
-- Name: FormStatusHistory FormStatusHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormStatusHistory"
    ADD CONSTRAINT "FormStatusHistory_pkey" PRIMARY KEY (id);


--
-- Name: FormTemplate FormTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormTemplate"
    ADD CONSTRAINT "FormTemplate_pkey" PRIMARY KEY (id);


--
-- Name: FormVersion FormVersion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormVersion"
    ADD CONSTRAINT "FormVersion_pkey" PRIMARY KEY (id);


--
-- Name: Phase Phase_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Phase"
    ADD CONSTRAINT "Phase_pkey" PRIMARY KEY (id);


--
-- Name: ProjectPhase ProjectPhase_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectPhase"
    ADD CONSTRAINT "ProjectPhase_pkey" PRIMARY KEY (id);


--
-- Name: ProjectTask ProjectTask_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectTask"
    ADD CONSTRAINT "ProjectTask_pkey" PRIMARY KEY (id);


--
-- Name: Project Project_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: TaskActivity TaskActivity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskActivity"
    ADD CONSTRAINT "TaskActivity_pkey" PRIMARY KEY (id);


--
-- Name: UserPreference UserPreference_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserPreference"
    ADD CONSTRAINT "UserPreference_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WorkflowTask WorkflowTask_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkflowTask"
    ADD CONSTRAINT "WorkflowTask_pkey" PRIMARY KEY (id);


--
-- Name: Workflow Workflow_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Workflow"
    ADD CONSTRAINT "Workflow_pkey" PRIMARY KEY (id);


--
-- Name: _FormDependencies _FormDependencies_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_FormDependencies"
    ADD CONSTRAINT "_FormDependencies_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _UserDepartments _UserDepartments_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_UserDepartments"
    ADD CONSTRAINT "_UserDepartments_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: Department_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Department_name_key" ON public."Department" USING btree (name);


--
-- Name: FormCompletionRequirement_templateId_phaseId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "FormCompletionRequirement_templateId_phaseId_key" ON public."FormCompletionRequirement" USING btree ("templateId", "phaseId");


--
-- Name: FormInstance_templateId_projectTaskId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "FormInstance_templateId_projectTaskId_key" ON public."FormInstance" USING btree ("templateId", "projectTaskId");


--
-- Name: FormVersion_templateId_version_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "FormVersion_templateId_version_key" ON public."FormVersion" USING btree ("templateId", version);


--
-- Name: ProjectTask_assignedToId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProjectTask_assignedToId_idx" ON public."ProjectTask" USING btree ("assignedToId");


--
-- Name: ProjectTask_departmentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProjectTask_departmentId_idx" ON public."ProjectTask" USING btree ("departmentId");


--
-- Name: ProjectTask_phaseId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProjectTask_phaseId_idx" ON public."ProjectTask" USING btree ("phaseId");


--
-- Name: ProjectTask_projectId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProjectTask_projectId_idx" ON public."ProjectTask" USING btree ("projectId");


--
-- Name: ProjectTask_workflowTaskId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProjectTask_workflowTaskId_idx" ON public."ProjectTask" USING btree ("workflowTaskId");


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: TaskActivity_taskId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "TaskActivity_taskId_idx" ON public."TaskActivity" USING btree ("taskId");


--
-- Name: TaskActivity_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "TaskActivity_userId_idx" ON public."TaskActivity" USING btree ("userId");


--
-- Name: UserPreference_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserPreference_userId_key" ON public."UserPreference" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_name_key" ON public."User" USING btree (name);


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: _FormDependencies_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_FormDependencies_B_index" ON public."_FormDependencies" USING btree ("B");


--
-- Name: _UserDepartments_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_UserDepartments_B_index" ON public."_UserDepartments" USING btree ("B");


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FormCompletionRequirement FormCompletionRequirement_phaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormCompletionRequirement"
    ADD CONSTRAINT "FormCompletionRequirement_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES public."Phase"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FormCompletionRequirement FormCompletionRequirement_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormCompletionRequirement"
    ADD CONSTRAINT "FormCompletionRequirement_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."FormTemplate"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FormInstance FormInstance_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormInstance"
    ADD CONSTRAINT "FormInstance_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FormInstance FormInstance_projectTaskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormInstance"
    ADD CONSTRAINT "FormInstance_projectTaskId_fkey" FOREIGN KEY ("projectTaskId") REFERENCES public."ProjectTask"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FormInstance FormInstance_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormInstance"
    ADD CONSTRAINT "FormInstance_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."FormTemplate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FormInstance FormInstance_versionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormInstance"
    ADD CONSTRAINT "FormInstance_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES public."FormVersion"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FormResponseHistory FormResponseHistory_changedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormResponseHistory"
    ADD CONSTRAINT "FormResponseHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FormResponseHistory FormResponseHistory_responseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormResponseHistory"
    ADD CONSTRAINT "FormResponseHistory_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES public."FormResponse"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FormResponse FormResponse_instanceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormResponse"
    ADD CONSTRAINT "FormResponse_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES public."FormInstance"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FormResponse FormResponse_reviewedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormResponse"
    ADD CONSTRAINT "FormResponse_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: FormResponse FormResponse_submittedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormResponse"
    ADD CONSTRAINT "FormResponse_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: FormResponse FormResponse_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormResponse"
    ADD CONSTRAINT "FormResponse_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public."ProjectTask"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FormResponse FormResponse_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormResponse"
    ADD CONSTRAINT "FormResponse_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."FormTemplate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FormStatusHistory FormStatusHistory_changedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormStatusHistory"
    ADD CONSTRAINT "FormStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FormStatusHistory FormStatusHistory_instanceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormStatusHistory"
    ADD CONSTRAINT "FormStatusHistory_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES public."FormInstance"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FormTemplate FormTemplate_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormTemplate"
    ADD CONSTRAINT "FormTemplate_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public."Department"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: FormTemplate FormTemplate_phaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormTemplate"
    ADD CONSTRAINT "FormTemplate_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES public."Phase"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FormTemplate FormTemplate_workflowId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormTemplate"
    ADD CONSTRAINT "FormTemplate_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES public."Workflow"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FormVersion FormVersion_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormVersion"
    ADD CONSTRAINT "FormVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FormVersion FormVersion_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormVersion"
    ADD CONSTRAINT "FormVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."FormTemplate"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Phase Phase_workflowId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Phase"
    ADD CONSTRAINT "Phase_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES public."Workflow"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProjectPhase ProjectPhase_phaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectPhase"
    ADD CONSTRAINT "ProjectPhase_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES public."Phase"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProjectPhase ProjectPhase_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectPhase"
    ADD CONSTRAINT "ProjectPhase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProjectTask ProjectTask_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectTask"
    ADD CONSTRAINT "ProjectTask_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ProjectTask ProjectTask_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectTask"
    ADD CONSTRAINT "ProjectTask_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public."Department"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ProjectTask ProjectTask_phaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectTask"
    ADD CONSTRAINT "ProjectTask_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES public."ProjectPhase"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProjectTask ProjectTask_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectTask"
    ADD CONSTRAINT "ProjectTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProjectTask ProjectTask_workflowTaskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProjectTask"
    ADD CONSTRAINT "ProjectTask_workflowTaskId_fkey" FOREIGN KEY ("workflowTaskId") REFERENCES public."WorkflowTask"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Project Project_managerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Project Project_workflowId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES public."Workflow"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TaskActivity TaskActivity_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskActivity"
    ADD CONSTRAINT "TaskActivity_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public."ProjectTask"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TaskActivity TaskActivity_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskActivity"
    ADD CONSTRAINT "TaskActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserPreference UserPreference_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserPreference"
    ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WorkflowTask WorkflowTask_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkflowTask"
    ADD CONSTRAINT "WorkflowTask_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public."Department"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WorkflowTask WorkflowTask_phaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WorkflowTask"
    ADD CONSTRAINT "WorkflowTask_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES public."Phase"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _FormDependencies _FormDependencies_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_FormDependencies"
    ADD CONSTRAINT "_FormDependencies_A_fkey" FOREIGN KEY ("A") REFERENCES public."FormCompletionRequirement"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _FormDependencies _FormDependencies_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_FormDependencies"
    ADD CONSTRAINT "_FormDependencies_B_fkey" FOREIGN KEY ("B") REFERENCES public."FormCompletionRequirement"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _UserDepartments _UserDepartments_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_UserDepartments"
    ADD CONSTRAINT "_UserDepartments_A_fkey" FOREIGN KEY ("A") REFERENCES public."Department"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _UserDepartments _UserDepartments_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_UserDepartments"
    ADD CONSTRAINT "_UserDepartments_B_fkey" FOREIGN KEY ("B") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

