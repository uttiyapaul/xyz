create extension if not exists "pg_cron" with schema "pg_catalog";

create extension if not exists "btree_gist" with schema "extensions";

create extension if not exists "pg_trgm" with schema "extensions";

create extension if not exists "pgaudit" with schema "extensions";

create extension if not exists "vector" with schema "extensions";

drop extension if exists "pg_net";

drop trigger if exists "audit_activity" on "public"."activity_data";

drop trigger if exists "audit_results" on "public"."emission_results";

drop trigger if exists "audit_sources" on "public"."emission_sources";

drop policy "tenant_isolation_activity" on "public"."activity_data";

drop policy "tenant_isolation_results" on "public"."emission_results";

drop policy "tenant_isolation_sources" on "public"."emission_sources";

drop policy "tenant_isolation_evidence" on "public"."evidence_documents";

drop policy "tenant_isolation_organizations" on "public"."organizations";

drop policy "tenant_isolation_periods" on "public"."reporting_periods";

drop policy "tenant_isolation_sites" on "public"."sites";

drop policy "tenant_isolation_user_roles" on "public"."user_roles";

revoke delete on table "public"."activity_data" from "authenticated";

revoke references on table "public"."activity_data" from "authenticated";

revoke trigger on table "public"."activity_data" from "authenticated";

revoke truncate on table "public"."activity_data" from "authenticated";

revoke delete on table "public"."emission_factor_sources" from "authenticated";

revoke insert on table "public"."emission_factor_sources" from "authenticated";

revoke references on table "public"."emission_factor_sources" from "authenticated";

revoke trigger on table "public"."emission_factor_sources" from "authenticated";

revoke truncate on table "public"."emission_factor_sources" from "authenticated";

revoke update on table "public"."emission_factor_sources" from "authenticated";

revoke delete on table "public"."emission_factors" from "authenticated";

revoke insert on table "public"."emission_factors" from "authenticated";

revoke references on table "public"."emission_factors" from "authenticated";

revoke trigger on table "public"."emission_factors" from "authenticated";

revoke truncate on table "public"."emission_factors" from "authenticated";

revoke update on table "public"."emission_factors" from "authenticated";

revoke delete on table "public"."emission_results" from "anon";

revoke insert on table "public"."emission_results" from "anon";

revoke references on table "public"."emission_results" from "anon";

revoke select on table "public"."emission_results" from "anon";

revoke trigger on table "public"."emission_results" from "anon";

revoke truncate on table "public"."emission_results" from "anon";

revoke update on table "public"."emission_results" from "anon";

revoke delete on table "public"."emission_results" from "authenticated";

revoke insert on table "public"."emission_results" from "authenticated";

revoke references on table "public"."emission_results" from "authenticated";

revoke select on table "public"."emission_results" from "authenticated";

revoke trigger on table "public"."emission_results" from "authenticated";

revoke truncate on table "public"."emission_results" from "authenticated";

revoke update on table "public"."emission_results" from "authenticated";

revoke delete on table "public"."emission_results" from "service_role";

revoke insert on table "public"."emission_results" from "service_role";

revoke references on table "public"."emission_results" from "service_role";

revoke select on table "public"."emission_results" from "service_role";

revoke trigger on table "public"."emission_results" from "service_role";

revoke truncate on table "public"."emission_results" from "service_role";

revoke update on table "public"."emission_results" from "service_role";

revoke delete on table "public"."emission_sources" from "anon";

revoke insert on table "public"."emission_sources" from "anon";

revoke references on table "public"."emission_sources" from "anon";

revoke select on table "public"."emission_sources" from "anon";

revoke trigger on table "public"."emission_sources" from "anon";

revoke truncate on table "public"."emission_sources" from "anon";

revoke update on table "public"."emission_sources" from "anon";

revoke delete on table "public"."emission_sources" from "authenticated";

revoke insert on table "public"."emission_sources" from "authenticated";

revoke references on table "public"."emission_sources" from "authenticated";

revoke select on table "public"."emission_sources" from "authenticated";

revoke trigger on table "public"."emission_sources" from "authenticated";

revoke truncate on table "public"."emission_sources" from "authenticated";

revoke update on table "public"."emission_sources" from "authenticated";

revoke delete on table "public"."emission_sources" from "service_role";

revoke insert on table "public"."emission_sources" from "service_role";

revoke references on table "public"."emission_sources" from "service_role";

revoke select on table "public"."emission_sources" from "service_role";

revoke trigger on table "public"."emission_sources" from "service_role";

revoke truncate on table "public"."emission_sources" from "service_role";

revoke update on table "public"."emission_sources" from "service_role";

revoke delete on table "public"."evidence_documents" from "anon";

revoke insert on table "public"."evidence_documents" from "anon";

revoke references on table "public"."evidence_documents" from "anon";

revoke select on table "public"."evidence_documents" from "anon";

revoke trigger on table "public"."evidence_documents" from "anon";

revoke truncate on table "public"."evidence_documents" from "anon";

revoke update on table "public"."evidence_documents" from "anon";

revoke delete on table "public"."evidence_documents" from "authenticated";

revoke insert on table "public"."evidence_documents" from "authenticated";

revoke references on table "public"."evidence_documents" from "authenticated";

revoke select on table "public"."evidence_documents" from "authenticated";

revoke trigger on table "public"."evidence_documents" from "authenticated";

revoke truncate on table "public"."evidence_documents" from "authenticated";

revoke update on table "public"."evidence_documents" from "authenticated";

revoke delete on table "public"."evidence_documents" from "service_role";

revoke insert on table "public"."evidence_documents" from "service_role";

revoke references on table "public"."evidence_documents" from "service_role";

revoke select on table "public"."evidence_documents" from "service_role";

revoke trigger on table "public"."evidence_documents" from "service_role";

revoke truncate on table "public"."evidence_documents" from "service_role";

revoke update on table "public"."evidence_documents" from "service_role";

revoke delete on table "public"."ghg_audit_log" from "authenticated";

revoke references on table "public"."ghg_audit_log" from "authenticated";

revoke trigger on table "public"."ghg_audit_log" from "authenticated";

revoke truncate on table "public"."ghg_audit_log" from "authenticated";

revoke update on table "public"."ghg_audit_log" from "authenticated";

revoke delete on table "public"."organizations" from "anon";

revoke insert on table "public"."organizations" from "anon";

revoke references on table "public"."organizations" from "anon";

revoke select on table "public"."organizations" from "anon";

revoke trigger on table "public"."organizations" from "anon";

revoke truncate on table "public"."organizations" from "anon";

revoke update on table "public"."organizations" from "anon";

revoke delete on table "public"."organizations" from "authenticated";

revoke insert on table "public"."organizations" from "authenticated";

revoke references on table "public"."organizations" from "authenticated";

revoke select on table "public"."organizations" from "authenticated";

revoke trigger on table "public"."organizations" from "authenticated";

revoke truncate on table "public"."organizations" from "authenticated";

revoke update on table "public"."organizations" from "authenticated";

revoke delete on table "public"."organizations" from "service_role";

revoke insert on table "public"."organizations" from "service_role";

revoke references on table "public"."organizations" from "service_role";

revoke select on table "public"."organizations" from "service_role";

revoke trigger on table "public"."organizations" from "service_role";

revoke truncate on table "public"."organizations" from "service_role";

revoke update on table "public"."organizations" from "service_role";

revoke delete on table "public"."products" from "authenticated";

revoke insert on table "public"."products" from "authenticated";

revoke references on table "public"."products" from "authenticated";

revoke trigger on table "public"."products" from "authenticated";

revoke truncate on table "public"."products" from "authenticated";

revoke update on table "public"."products" from "authenticated";

revoke delete on table "public"."reporting_periods" from "anon";

revoke insert on table "public"."reporting_periods" from "anon";

revoke references on table "public"."reporting_periods" from "anon";

revoke select on table "public"."reporting_periods" from "anon";

revoke trigger on table "public"."reporting_periods" from "anon";

revoke truncate on table "public"."reporting_periods" from "anon";

revoke update on table "public"."reporting_periods" from "anon";

revoke delete on table "public"."reporting_periods" from "authenticated";

revoke insert on table "public"."reporting_periods" from "authenticated";

revoke references on table "public"."reporting_periods" from "authenticated";

revoke select on table "public"."reporting_periods" from "authenticated";

revoke trigger on table "public"."reporting_periods" from "authenticated";

revoke truncate on table "public"."reporting_periods" from "authenticated";

revoke update on table "public"."reporting_periods" from "authenticated";

revoke delete on table "public"."reporting_periods" from "service_role";

revoke insert on table "public"."reporting_periods" from "service_role";

revoke references on table "public"."reporting_periods" from "service_role";

revoke select on table "public"."reporting_periods" from "service_role";

revoke trigger on table "public"."reporting_periods" from "service_role";

revoke truncate on table "public"."reporting_periods" from "service_role";

revoke update on table "public"."reporting_periods" from "service_role";

revoke delete on table "public"."sectors" from "authenticated";

revoke insert on table "public"."sectors" from "authenticated";

revoke references on table "public"."sectors" from "authenticated";

revoke trigger on table "public"."sectors" from "authenticated";

revoke truncate on table "public"."sectors" from "authenticated";

revoke update on table "public"."sectors" from "authenticated";

revoke delete on table "public"."sites" from "anon";

revoke insert on table "public"."sites" from "anon";

revoke references on table "public"."sites" from "anon";

revoke select on table "public"."sites" from "anon";

revoke trigger on table "public"."sites" from "anon";

revoke truncate on table "public"."sites" from "anon";

revoke update on table "public"."sites" from "anon";

revoke delete on table "public"."sites" from "authenticated";

revoke insert on table "public"."sites" from "authenticated";

revoke references on table "public"."sites" from "authenticated";

revoke select on table "public"."sites" from "authenticated";

revoke trigger on table "public"."sites" from "authenticated";

revoke truncate on table "public"."sites" from "authenticated";

revoke update on table "public"."sites" from "authenticated";

revoke delete on table "public"."sites" from "service_role";

revoke insert on table "public"."sites" from "service_role";

revoke references on table "public"."sites" from "service_role";

revoke select on table "public"."sites" from "service_role";

revoke trigger on table "public"."sites" from "service_role";

revoke truncate on table "public"."sites" from "service_role";

revoke update on table "public"."sites" from "service_role";

revoke delete on table "public"."user_roles" from "anon";

revoke insert on table "public"."user_roles" from "anon";

revoke references on table "public"."user_roles" from "anon";

revoke select on table "public"."user_roles" from "anon";

revoke trigger on table "public"."user_roles" from "anon";

revoke truncate on table "public"."user_roles" from "anon";

revoke update on table "public"."user_roles" from "anon";

revoke delete on table "public"."user_roles" from "authenticated";

revoke insert on table "public"."user_roles" from "authenticated";

revoke references on table "public"."user_roles" from "authenticated";

revoke select on table "public"."user_roles" from "authenticated";

revoke trigger on table "public"."user_roles" from "authenticated";

revoke truncate on table "public"."user_roles" from "authenticated";

revoke update on table "public"."user_roles" from "authenticated";

revoke delete on table "public"."user_roles" from "service_role";

revoke insert on table "public"."user_roles" from "service_role";

revoke references on table "public"."user_roles" from "service_role";

revoke select on table "public"."user_roles" from "service_role";

revoke trigger on table "public"."user_roles" from "service_role";

revoke truncate on table "public"."user_roles" from "service_role";

revoke update on table "public"."user_roles" from "service_role";

alter table "public"."activity_data" drop constraint "activity_data_source_id_fkey";

alter table "public"."emission_factors" drop constraint "emission_factors_gas_type_check";

alter table "public"."emission_factors" drop constraint "emission_factors_source_id_fkey";

alter table "public"."emission_results" drop constraint "emission_results_activity_id_fkey";

alter table "public"."emission_results" drop constraint "emission_results_emission_factor_id_fkey";

alter table "public"."emission_results" drop constraint "emission_results_organization_id_fkey";

alter table "public"."emission_sources" drop constraint "emission_sources_organization_id_fkey";

alter table "public"."emission_sources" drop constraint "emission_sources_scope_check";

alter table "public"."emission_sources" drop constraint "emission_sources_site_id_fkey";

alter table "public"."evidence_documents" drop constraint "evidence_documents_activity_id_fkey";

alter table "public"."evidence_documents" drop constraint "evidence_documents_organization_id_fkey";

alter table "public"."reporting_periods" drop constraint "reporting_periods_organization_id_fkey";

alter table "public"."reporting_periods" drop constraint "reporting_periods_organization_id_year_quarter_key";

alter table "public"."reporting_periods" drop constraint "reporting_periods_quarter_check";

alter table "public"."reporting_periods" drop constraint "reporting_periods_status_check";

alter table "public"."sites" drop constraint "sites_organization_id_fkey";

alter table "public"."user_roles" drop constraint "user_roles_organization_id_fkey";

alter table "public"."user_roles" drop constraint "user_roles_role_check";

alter table "public"."user_roles" drop constraint "user_roles_user_id_organization_id_key";

alter table "public"."activity_data" drop constraint "activity_data_organization_id_fkey";

alter table "public"."emission_results" drop constraint "emission_results_pkey";

alter table "public"."emission_sources" drop constraint "emission_sources_pkey";

alter table "public"."evidence_documents" drop constraint "evidence_documents_pkey";

alter table "public"."organizations" drop constraint "organizations_pkey";

alter table "public"."reporting_periods" drop constraint "reporting_periods_pkey";

alter table "public"."sites" drop constraint "sites_pkey";

alter table "public"."user_roles" drop constraint "user_roles_pkey";

alter table "public"."emission_factor_sources" drop constraint "emission_factor_sources_pkey";

drop index if exists "public"."emission_results_pkey";

drop index if exists "public"."emission_sources_pkey";

drop index if exists "public"."evidence_documents_pkey";

drop index if exists "public"."idx_activity_date";

drop index if exists "public"."idx_activity_org";

drop index if exists "public"."idx_activity_source";

drop index if exists "public"."idx_results_activity";

drop index if exists "public"."idx_results_org";

drop index if exists "public"."idx_sources_org";

drop index if exists "public"."idx_user_roles_org";

drop index if exists "public"."idx_user_roles_user";

drop index if exists "public"."organizations_pkey";

drop index if exists "public"."reporting_periods_organization_id_year_quarter_key";

drop index if exists "public"."reporting_periods_pkey";

drop index if exists "public"."sites_pkey";

drop index if exists "public"."user_roles_pkey";

drop index if exists "public"."user_roles_user_id_organization_id_key";

drop index if exists "public"."emission_factor_sources_pkey";

drop index if exists "public"."idx_sites_org";

drop table "public"."emission_results";

drop table "public"."emission_sources";

drop table "public"."evidence_documents";

drop table "public"."organizations";

drop table "public"."reporting_periods";

drop table "public"."sites";

drop table "public"."user_roles";


  create table "public"."ai_models" (
    "id" uuid not null default gen_random_uuid(),
    "model_name" text not null,
    "model_type" text not null,
    "version" text not null,
    "training_date" date,
    "training_dataset" text,
    "framework" text,
    "algorithm" text,
    "accuracy_metric" text,
    "accuracy_value" numeric,
    "model_metadata" jsonb,
    "deployment_url" text,
    "is_active" boolean default true,
    "deprecated_at" timestamp with time zone,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."ai_models" enable row level security;


  create table "public"."ai_validation" (
    "id" uuid not null default gen_random_uuid(),
    "record_id" uuid not null,
    "table_name" text not null,
    "organization_id" uuid not null,
    "model_id" uuid,
    "model_version" text not null,
    "anomaly_score" numeric(5,4),
    "trust_score" numeric(4,3),
    "risk_level" text not null default 'unscored'::text,
    "validation_status" text not null default 'pending'::text,
    "z_score" numeric,
    "peer_avg" numeric,
    "peer_stddev" numeric,
    "is_outlier" boolean default false,
    "outlier_reason" text,
    "ai_comment" text,
    "ai_recommendation" text,
    "flagged_for_audit" boolean default false,
    "human_reviewed" boolean default false,
    "human_reviewer_id" uuid,
    "human_decision" text,
    "human_notes" text,
    "reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."ai_validation" enable row level security;


  create table "public"."api_keys" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "created_by" uuid not null,
    "key_name" text not null,
    "key_prefix" text not null,
    "key_hash" text not null,
    "scopes" text[] not null default ARRAY['data:read'::text],
    "allowed_ips" inet[],
    "rate_limit_per_min" integer default 60,
    "expires_at" timestamp with time zone,
    "last_used_at" timestamp with time zone,
    "last_used_ip" inet,
    "usage_count" bigint default 0,
    "is_active" boolean default true,
    "revoked_at" timestamp with time zone,
    "revoked_by" uuid,
    "revocation_reason" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."api_keys" enable row level security;


  create table "public"."carbon_offset_registries" (
    "id" text not null,
    "name" text not null,
    "registry_url" text,
    "credit_type" text not null,
    "standard_body" text
      );


alter table "public"."carbon_offset_registries" enable row level security;


  create table "public"."carbon_offsets" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "registry_id" text not null,
    "serial_number" text not null,
    "project_name" text not null,
    "project_id" text,
    "project_type" text not null,
    "project_country" text,
    "vintage_year" integer not null,
    "quantity_tco2e" numeric not null,
    "price_per_tco2e_usd" numeric,
    "total_cost_inr" numeric,
    "purchase_date" date not null,
    "retirement_date" date,
    "is_retired" boolean default false,
    "retirement_purpose" text,
    "fy_year_applied" text,
    "scope_offset" integer,
    "is_additional" boolean,
    "is_permanent" boolean,
    "verifier" text,
    "verification_standard" text,
    "co_benefits" text[],
    "document_id" uuid,
    "notes" text,
    "created_by" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."carbon_offsets" enable row level security;


  create table "public"."client_assets" (
    "id" uuid not null default gen_random_uuid(),
    "site_id" uuid not null,
    "organization_id" uuid not null,
    "asset_name" text not null,
    "asset_type" text,
    "asset_tag" text,
    "make" text,
    "model" text,
    "year_of_manufacture" integer,
    "installed_at" date,
    "capacity" text,
    "fuel_type" text,
    "refrigerant_type" text,
    "refrigerant_charge_kg" numeric,
    "last_service_date" date,
    "next_service_date" date,
    "is_active" boolean default true,
    "decommissioned_at" date,
    "notes" text,
    "erp_asset_code" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "created_by" uuid,
    "deleted_at" timestamp with time zone,
    "deleted_by" uuid
      );


alter table "public"."client_assets" enable row level security;


  create table "public"."client_legal_entities" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "entity_name" text not null,
    "cin" text,
    "entity_type" text,
    "ownership_pct" numeric,
    "country" text default 'IN'::text,
    "is_in_boundary" boolean not null default true,
    "exclusion_reason" text,
    "included_from_fy" text,
    "excluded_from_fy" text,
    "created_at" timestamp with time zone default now(),
    "created_by" uuid,
    "deleted_at" timestamp with time zone,
    "deleted_by" uuid
      );


alter table "public"."client_legal_entities" enable row level security;


  create table "public"."client_organizations" (
    "id" uuid not null default gen_random_uuid(),
    "legal_name" text not null,
    "trade_name" text,
    "cin" text,
    "gstin" text,
    "pan" text,
    "registered_address" text not null,
    "city" text,
    "state" text,
    "pin_code" text,
    "country" text default 'IN'::text,
    "industry_segment_id" text,
    "nic_code" text,
    "employee_count_range" text,
    "annual_turnover_cr" numeric,
    "is_listed" boolean default false,
    "stock_exchange" text,
    "isin" text,
    "brsr_required" boolean default false,
    "brsr_core_required" boolean default false,
    "reporting_currency" text default 'INR'::text,
    "fiscal_year_start_month" integer default 4,
    "consolidation_approach" text,
    "consolidation_justification" text,
    "gwp_basis" text default 'AR6'::text,
    "gwp_change_log" jsonb default '[]'::jsonb,
    "primary_contact_name" text,
    "primary_contact_email" text,
    "primary_contact_phone" text,
    "primary_contact_designation" text,
    "assigned_consultant_id" uuid,
    "onboarded_at" timestamp with time zone default now(),
    "is_active" boolean default true,
    "erp_system_type" text,
    "erp_tenant_code" text,
    "erp_sync_enabled" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "created_by" uuid,
    "updated_by" uuid,
    "deleted_at" timestamp with time zone,
    "deleted_by" uuid
      );


alter table "public"."client_organizations" enable row level security;


  create table "public"."client_sites" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "legal_entity_id" uuid,
    "site_name" text not null,
    "site_code" text,
    "site_type" text,
    "address" text,
    "city" text not null,
    "state" text not null,
    "pin_code" text,
    "latitude" numeric(10,7),
    "longitude" numeric(10,7),
    "floor_area_sqm" numeric,
    "electricity_account_nos" text[],
    "discom_name" text,
    "grid_zone" text,
    "has_captive_solar" boolean default false,
    "solar_capacity_kwp" numeric,
    "has_dg_set" boolean default false,
    "dg_capacity_kva" numeric,
    "has_captive_water" boolean default false,
    "is_in_boundary" boolean not null default true,
    "exclusion_reason" text,
    "included_from_fy" text,
    "excluded_from_fy" text,
    "is_active" boolean default true,
    "erp_site_code" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "created_by" uuid,
    "updated_by" uuid,
    "deleted_at" timestamp with time zone,
    "deleted_by" uuid
      );


alter table "public"."client_sites" enable row level security;


  create table "public"."consent_records" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "organization_id" uuid,
    "consent_type" text not null,
    "lawful_basis" text not null,
    "policy_version" text not null,
    "consented_at" timestamp with time zone not null default now(),
    "ip_address" inet,
    "user_agent" text,
    "withdrawn_at" timestamp with time zone,
    "withdrawal_reason" text,
    "is_withdrawn" boolean not null default false,
    "dpdp_notice_version" text,
    "ccpa_applicable" boolean not null default false,
    "gdpr_applicable" boolean not null default false,
    "notes" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."consent_records" enable row level security;


  create table "public"."consultants" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "full_name" text not null,
    "email" text not null,
    "designation" text,
    "qualification" text,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "deleted_at" timestamp with time zone
      );


alter table "public"."consultants" enable row level security;


  create table "public"."consumer_data_requests" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid,
    "requester_email" text not null,
    "requester_name" text,
    "request_type" text not null,
    "status" text not null default 'received'::text,
    "identity_verified" boolean not null default false,
    "verification_method" text,
    "opt_out_categories" text[],
    "requested_at" timestamp with time zone not null default now(),
    "due_at" timestamp with time zone,
    "fulfilled_at" timestamp with time zone,
    "rejection_reason" text,
    "handled_by" uuid,
    "response_notes" text,
    "sla_met" boolean,
    "ip_address" inet,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."consumer_data_requests" enable row level security;


  create table "public"."data_portability_exports" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "organization_id" uuid,
    "requested_by" uuid not null,
    "status" text not null default 'requested'::text,
    "export_format" text not null default 'json'::text,
    "tables_included" text[] not null default ARRAY['ghg_monthly_readings'::text, 'activity_data'::text, 'ghg_documents'::text, 'user_sessions'::text, 'consent_records'::text],
    "file_storage_path" text,
    "file_size_bytes" bigint,
    "checksum_sha256" text,
    "requested_at" timestamp with time zone not null default now(),
    "due_at" timestamp with time zone,
    "processing_started_at" timestamp with time zone,
    "ready_at" timestamp with time zone,
    "downloaded_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    "error_message" text,
    "sla_met" boolean,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."data_portability_exports" enable row level security;


  create table "public"."data_quality_audit" (
    "id" uuid not null default gen_random_uuid(),
    "record_id" uuid not null,
    "table_name" text not null,
    "organization_id" uuid not null,
    "field_name" text,
    "old_value" text,
    "new_value" text,
    "change_reason" text not null,
    "ai_suggested" boolean not null default false,
    "model_id" uuid,
    "confidence" numeric(4,3),
    "changed_by" uuid,
    "accepted_by" uuid,
    "accepted_at" timestamp with time zone,
    "status" text default 'pending'::text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."data_quality_audit" enable row level security;


  create table "public"."data_retention_policies" (
    "id" uuid not null default gen_random_uuid(),
    "entity_type" text not null,
    "retention_years" integer not null,
    "legal_basis" text not null,
    "applicable_law" text[] default ARRAY['Companies_Act_2013'::text, 'DPDP_2023'::text],
    "auto_purge_enabled" boolean default false,
    "purge_action" text default 'soft_delete'::text,
    "notes" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."data_retention_policies" enable row level security;


  create table "public"."data_sale_opt_outs" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "email" text not null,
    "opt_out_method" text not null default 'web_form'::text,
    "is_opted_out" boolean not null default true,
    "opted_out_at" timestamp with time zone not null default now(),
    "opted_back_in_at" timestamp with time zone,
    "ip_address" inet,
    "notes" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."data_sale_opt_outs" enable row level security;


  create table "public"."data_subject_access_requests" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid,
    "user_id" uuid,
    "requester_email" text not null,
    "requester_name" text,
    "request_type" text not null,
    "request_description" text,
    "status" text not null default 'received'::text,
    "identity_verified" boolean not null default false,
    "verification_method" text,
    "requested_at" timestamp with time zone not null default now(),
    "due_at" timestamp with time zone,
    "processing_started_at" timestamp with time zone,
    "fulfilled_at" timestamp with time zone,
    "rejection_reason" text,
    "legal_hold" boolean not null default false,
    "legal_hold_reason" text,
    "handled_by" uuid,
    "response_notes" text,
    "data_delivered_path" text,
    "sla_met" boolean,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."data_subject_access_requests" enable row level security;


  create table "public"."disclosure_frameworks" (
    "id" text not null,
    "framework_name" text not null,
    "full_name" text,
    "framework_type" text not null,
    "governing_body" text,
    "applicable_region" text[],
    "reporting_url" text,
    "notes" text
      );


alter table "public"."disclosure_frameworks" enable row level security;


  create table "public"."dpdp_erasure_requests" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "organization_id" uuid,
    "request_type" text not null,
    "request_reason" text,
    "status" text not null default 'received'::text,
    "rejection_reason" text,
    "entities_affected" text[],
    "completed_at" timestamp with time zone,
    "handled_by" uuid,
    "legal_hold" boolean default false,
    "legal_hold_reason" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."dpdp_erasure_requests" enable row level security;


  create table "public"."emission_factor_versions" (
    "id" uuid not null default gen_random_uuid(),
    "factor_code" text not null,
    "version_from" text not null,
    "version_to" text not null,
    "old_factor_id" uuid not null,
    "new_factor_id" uuid not null,
    "old_kgco2e_per_unit" numeric not null,
    "new_kgco2e_per_unit" numeric not null,
    "change_pct" numeric generated always as (
CASE
    WHEN (old_kgco2e_per_unit = (0)::numeric) THEN NULL::numeric
    ELSE round((((new_kgco2e_per_unit - old_kgco2e_per_unit) / old_kgco2e_per_unit) * (100)::numeric), 4)
END) stored,
    "change_reason" text not null,
    "source_change_desc" text,
    "effective_date" date not null,
    "requires_recalc" boolean default false,
    "impacted_readings" integer default 0,
    "recalc_initiated" boolean default false,
    "recalc_completed_at" timestamp with time zone,
    "approved_by" uuid,
    "approved_at" timestamp with time zone default now(),
    "management_notified" boolean default false,
    "notes" text
      );


alter table "public"."emission_factor_versions" enable row level security;


  create table "public"."erp_connection_vault" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "erp_system_id" uuid,
    "secret_type" text not null,
    "secret_label" text not null,
    "encrypted_value" bytea not null,
    "key_reference" text not null,
    "expires_at" timestamp with time zone,
    "last_rotated_at" timestamp with time zone default now(),
    "rotated_by" uuid,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "created_by" uuid not null
      );


alter table "public"."erp_connection_vault" enable row level security;


  create table "public"."erp_field_mappings" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "erp_system_id" uuid not null,
    "erp_account_code" text not null,
    "erp_account_name" text,
    "erp_cost_center" text,
    "erp_material_code" text,
    "ghg_field_key" text not null,
    "ghg_site_id" uuid,
    "unit_conversion" numeric default 1.0,
    "erp_unit" text,
    "ghg_unit" text,
    "is_active" boolean default true,
    "notes" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."erp_field_mappings" enable row level security;


  create table "public"."erp_sync_logs" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "erp_system_id" uuid not null,
    "sync_type" text not null,
    "sync_period_from" date,
    "sync_period_to" date,
    "records_fetched" integer default 0,
    "records_mapped" integer default 0,
    "records_failed" integer default 0,
    "readings_created" integer default 0,
    "readings_updated" integer default 0,
    "status" text not null,
    "error_details" jsonb,
    "raw_payload_sample" jsonb,
    "triggered_by" text,
    "started_at" timestamp with time zone default now(),
    "completed_at" timestamp with time zone,
    "data_classification" text default 'internal'::text,
    "payload_purged_at" timestamp with time zone
      );


alter table "public"."erp_sync_logs" enable row level security;


  create table "public"."erp_systems" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "system_type" text not null,
    "system_version" text,
    "connection_type" text default 'webhook'::text,
    "endpoint_url" text,
    "auth_type" text,
    "is_active" boolean default false,
    "last_test_at" timestamp with time zone,
    "last_test_status" text,
    "sync_frequency" text default 'monthly'::text,
    "sync_day_of_month" integer default 5,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."erp_systems" enable row level security;


  create table "public"."feature_flags" (
    "id" uuid not null default gen_random_uuid(),
    "flag_key" text not null,
    "description" text not null,
    "enabled_globally" boolean default false,
    "enabled_for_plan_tiers" text[] default ARRAY[]::text[],
    "enabled_for_org_ids" uuid[] default ARRAY[]::uuid[],
    "enabled_for_user_ids" uuid[] default ARRAY[]::uuid[],
    "rollout_pct" integer default 0,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."feature_flags" enable row level security;


  create table "public"."fleet_monthly_logs" (
    "id" uuid not null default gen_random_uuid(),
    "vehicle_id" uuid not null,
    "organization_id" uuid not null,
    "site_id" uuid not null,
    "month" integer not null,
    "year" integer not null,
    "fy_year" text not null,
    "fuel_type_actual" text not null,
    "fuel_quantity" numeric not null,
    "fuel_unit" text not null,
    "fuel_cost_inr" numeric,
    "fuel_fill_count" integer,
    "fuel_card_ref" text,
    "odometer_start_km" numeric,
    "odometer_end_km" numeric,
    "km_driven" numeric generated always as ((COALESCE(odometer_end_km, (0)::numeric) - COALESCE(odometer_start_km, (0)::numeric))) stored,
    "gps_km_driven" numeric,
    "km_data_source" text default 'odometer'::text,
    "total_tkm" numeric,
    "avg_load_factor_pct" numeric,
    "reefer_fuel_liters" numeric,
    "reefer_hours_run" numeric,
    "ev_kwh_ac_charged" numeric,
    "ev_kwh_dc_charged" numeric,
    "emission_factor_id" uuid,
    "ef_kgco2e_per_unit" numeric,
    "kgco2e_fuel" numeric,
    "kgco2e_reefer" numeric,
    "kgco2e_total" numeric,
    "trust_score" numeric(4,3),
    "risk_level" text default 'unscored'::text,
    "ai_validated" boolean default false,
    "data_source_type" text default 'fuel_card'::text,
    "is_estimated" boolean default false,
    "anomaly_flag" boolean default false,
    "anomaly_note" text,
    "entered_by" uuid not null,
    "reviewed_by" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."fleet_monthly_logs" enable row level security;


  create table "public"."fleet_vehicles" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "legal_entity_id" uuid,
    "site_id" uuid not null,
    "registration_number" text not null,
    "make" text not null,
    "model" text not null,
    "year_of_manufacture" integer not null,
    "vehicle_category" text not null,
    "vehicle_use_type" text not null,
    "fuel_type" text not null,
    "engine_emission_standard" text,
    "laden_capacity_tonnes" numeric,
    "seating_capacity" integer,
    "fuel_efficiency_kmpl" numeric,
    "fuel_efficiency_source" text,
    "has_ac" boolean default false,
    "ac_refrigerant_type" text,
    "ac_refrigerant_charge_kg" numeric,
    "is_reefer" boolean default false,
    "reefer_refrigerant_type" text,
    "reefer_refrigerant_charge_kg" numeric,
    "ownership_type" text not null,
    "boundary_inclusion" text not null default 'operational_control'::text,
    "exclusion_justification" text,
    "rc_number" text,
    "rc_expiry" date,
    "fitness_expiry" date,
    "insurance_policy_no" text,
    "insurance_expiry" date,
    "puc_certificate_no" text,
    "puc_expiry" date,
    "puc_co_reading_pct" numeric,
    "puc_hc_reading_ppm" numeric,
    "gps_device_id" text,
    "telematics_provider" text,
    "acquisition_date" date,
    "acquisition_cost_inr" numeric,
    "disposal_date" date,
    "disposal_method" text,
    "is_active" boolean default true,
    "erp_asset_code" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "created_by" uuid,
    "deleted_at" timestamp with time zone,
    "deleted_by" uuid
      );


alter table "public"."fleet_vehicles" enable row level security;


  create table "public"."framework_disclosures" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "framework_id" text not null,
    "indicator_id" uuid not null,
    "fy_year" text not null,
    "value_numeric" numeric,
    "value_text" text,
    "value_unit" text,
    "notes" text,
    "methodology" text,
    "data_source" text,
    "is_assured" boolean default false,
    "assurance_level" text,
    "supporting_docs" uuid[],
    "submitted_by" uuid,
    "submitted_at" timestamp with time zone,
    "status" text default 'draft'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."framework_disclosures" enable row level security;


  create table "public"."framework_indicators" (
    "id" uuid not null default gen_random_uuid(),
    "framework_id" text not null,
    "indicator_code" text not null,
    "indicator_name" text not null,
    "indicator_desc" text,
    "data_type" text,
    "unit" text,
    "ghg_field_keys" text[],
    "ghg_scope" integer[],
    "is_mandatory" boolean default false,
    "reporting_level" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."framework_indicators" enable row level security;


  create table "public"."ghg_anomaly_flags" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "reading_id" uuid,
    "fleet_log_id" uuid,
    "activity_data_id" uuid,
    "field_key" text not null,
    "detection_method" text not null default 'z_score'::text,
    "model_id" uuid,
    "anomaly_score" numeric,
    "threshold_used" numeric,
    "flagged_value" numeric,
    "expected_range_low" numeric,
    "expected_range_high" numeric,
    "is_confirmed" boolean default false,
    "resolution" text,
    "detected_at" timestamp with time zone default now(),
    "resolved_at" timestamp with time zone,
    "resolved_by" uuid
      );


alter table "public"."ghg_anomaly_flags" enable row level security;


  create table "public"."ghg_base_year_recalculations" (
    "id" uuid not null default gen_random_uuid(),
    "base_year_id" uuid not null,
    "recalculation_date" date not null default CURRENT_DATE,
    "trigger_type" text not null,
    "trigger_description" text not null,
    "old_scope1_tco2e" numeric not null,
    "new_scope1_tco2e" numeric not null,
    "old_scope2_tco2e" numeric not null,
    "new_scope2_tco2e" numeric not null,
    "old_total_tco2e" numeric not null,
    "new_total_tco2e" numeric not null,
    "change_pct" numeric generated always as (
CASE
    WHEN (old_total_tco2e = (0)::numeric) THEN NULL::numeric
    ELSE round((((new_total_tco2e - old_total_tco2e) / old_total_tco2e) * (100)::numeric), 4)
END) stored,
    "approved_by" uuid not null,
    "verifier_notified" boolean default false,
    "recalculation_document_url" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."ghg_base_year_recalculations" enable row level security;


  create table "public"."ghg_base_years" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "base_year" text not null,
    "base_year_scope1_tco2e" numeric not null,
    "base_year_scope2_tco2e" numeric not null,
    "base_year_scope3_tco2e" numeric,
    "base_year_total_tco2e" numeric not null,
    "selection_rationale" text not null,
    "is_locked" boolean default false,
    "locked_at" timestamp with time zone,
    "locked_by" uuid,
    "recalculation_trigger_policy" text not null default 'Recalculate if structural change, methodology change, or data error causes >5% change.'::text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."ghg_base_years" enable row level security;


  create table "public"."ghg_calculation_methodologies" (
    "id" uuid not null default gen_random_uuid(),
    "methodology_name" text not null,
    "methodology_type" text not null,
    "formula_expression" text,
    "assumptions" text,
    "data_requirements" text[],
    "reference_standard" text not null,
    "uncertainty_method" text,
    "documentation_url" text,
    "is_active" boolean default true,
    "created_by" uuid,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."ghg_calculation_methodologies" enable row level security;


  create table "public"."ghg_corrective_actions" (
    "id" uuid not null default gen_random_uuid(),
    "finding_id" uuid,
    "internal_audit_id" uuid,
    "organization_id" uuid not null,
    "root_cause" text not null,
    "corrective_action_plan" text not null,
    "responsible_person" text not null,
    "target_completion_date" date not null,
    "status" text default 'open'::text,
    "verification_evidence" text,
    "closed_at" date,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."ghg_corrective_actions" enable row level security;


  create table "public"."ghg_data_quality_assessments" (
    "id" uuid not null default gen_random_uuid(),
    "reading_id" uuid not null,
    "organization_id" uuid not null,
    "fy_year" text not null,
    "completeness_score" integer,
    "accuracy_score" integer,
    "consistency_score" integer,
    "transparency_score" integer,
    "relevance_score" integer,
    "overall_quality_score" numeric generated always as (((((((COALESCE(completeness_score, 3) + COALESCE(accuracy_score, 3)) + COALESCE(consistency_score, 3)) + COALESCE(transparency_score, 3)) + COALESCE(relevance_score, 3)))::numeric / 5.0)) stored,
    "assessment_method" text,
    "assessed_by" uuid,
    "assessed_at" timestamp with time zone default now(),
    "notes" text
      );


alter table "public"."ghg_data_quality_assessments" enable row level security;


  create table "public"."ghg_documents" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "site_id" uuid,
    "reading_id" uuid,
    "vehicle_id" uuid,
    "asset_id" uuid,
    "hazmat_id" uuid,
    "submission_id" uuid,
    "amendment_id" uuid,
    "file_name" text not null,
    "storage_bucket" text not null default 'ghg-evidence'::text,
    "storage_path" text not null,
    "file_hash_sha256" text not null,
    "file_size_bytes" bigint,
    "mime_type" text,
    "document_type" text not null,
    "period_covered_from" date not null,
    "period_covered_to" date not null,
    "field_keys_justified" text[],
    "quantity_stated_in_doc" numeric,
    "quantity_unit" text,
    "amount_inr_stated" numeric,
    "issuer_name" text,
    "issuer_gstin" text,
    "document_date" date,
    "document_ref_number" text,
    "uploaded_by" uuid not null,
    "uploaded_at" timestamp with time zone not null default now(),
    "is_primary_evidence" boolean default true,
    "is_original" boolean default true,
    "reviewed_by" uuid,
    "reviewed_at" timestamp with time zone,
    "review_status" text default 'pending'::text,
    "review_comment" text,
    "verifier_reviewed" boolean default false,
    "verifier_review_comment" text,
    "extraction_status" text default 'pending'::text,
    "extraction_model_id" uuid,
    "extracted_quantity" numeric,
    "extracted_unit" text,
    "extracted_period" date,
    "extraction_confidence" numeric(4,3),
    "extraction_json" jsonb,
    "extraction_error" text,
    "needs_human_review" boolean default false,
    "human_review_notes" text,
    "retention_until" date,
    "is_locked" boolean default false,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."ghg_documents" enable row level security;


  create table "public"."ghg_emission_source_register" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "site_id" uuid,
    "asset_id" uuid,
    "fy_year" text not null,
    "source_name" text not null,
    "source_description" text not null,
    "source_category" text not null,
    "ghg_protocol_category" text,
    "scope" integer not null,
    "scope3_category" integer,
    "gases_emitted" text[] not null,
    "methodology_id" uuid,
    "emission_factor_id" uuid,
    "calculation_approach" text,
    "data_tier" text,
    "is_included" boolean not null,
    "materiality_assessment" text not null,
    "estimated_pct_of_total" numeric,
    "exclusion_justification" text,
    "data_collection_method" text,
    "field_key" text,
    "uncertainty_pct" numeric,
    "reviewed_by" uuid,
    "reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "created_by" uuid,
    "deleted_at" timestamp with time zone,
    "deleted_by" uuid
      );


alter table "public"."ghg_emission_source_register" enable row level security;


  create table "public"."ghg_exclusion_register" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "fy_year" text not null,
    "source_name" text not null,
    "scope" integer not null,
    "exclusion_reason" text not null,
    "materiality_evidence" text not null,
    "estimated_tco2e" numeric,
    "pct_of_known_total" numeric,
    "reinclude_trigger" text,
    "approved_by" uuid not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."ghg_exclusion_register" enable row level security;


  create table "public"."ghg_hazardous_consumables" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "site_id" uuid not null,
    "asset_id" uuid,
    "source_register_id" uuid,
    "submission_id" uuid,
    "month" integer,
    "year" integer not null,
    "fy_year" text not null,
    "substance_name" text not null,
    "cas_number" text not null,
    "iupac_name" text,
    "trade_name" text,
    "substance_category" text not null,
    "chemical_formula" text,
    "quantity_in_stock_start" numeric not null default 0,
    "quantity_purchased" numeric not null default 0,
    "quantity_consumed_used" numeric not null default 0,
    "quantity_leaked_est" numeric,
    "quantity_disposed" numeric not null default 0,
    "quantity_in_stock_end" numeric generated always as ((((quantity_in_stock_start + quantity_purchased) - quantity_consumed_used) - quantity_disposed)) stored,
    "unit" text not null default 'kg'::text,
    "quantity_for_calc" numeric not null,
    "calculation_method" text not null default 'top_up_method'::text,
    "gwp_100yr" numeric not null,
    "gwp_source" text not null,
    "odp" numeric default 0,
    "kgco2e_calculated" numeric generated always as ((quantity_for_calc * gwp_100yr)) stored,
    "is_ods" boolean default false,
    "is_f_gas" boolean default false,
    "is_pop" boolean default false,
    "is_svhc" boolean default false,
    "is_hazwaste_india" boolean default false,
    "applicable_regulations" text[],
    "ghs_hazard_classes" text[],
    "supplier_name" text,
    "supplier_gstin" text,
    "purchase_invoice_ref" text,
    "disposal_method" text,
    "disposal_vendor_name" text,
    "disposal_vendor_auth_no" text,
    "disposal_manifest_no" text,
    "disposal_date" date,
    "equipment_type" text,
    "is_estimated" boolean not null default false,
    "estimation_basis" text,
    "entered_by" uuid not null,
    "reviewed_by" uuid,
    "verified_by" uuid,
    "verified_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."ghg_hazardous_consumables" enable row level security;


  create table "public"."ghg_industry_segments" (
    "id" text not null,
    "display_name" text not null,
    "nic_code_prefix" text,
    "typical_scopes" integer[],
    "typical_scope3_cats" integer[],
    "is_cbam_eligible" boolean default false,
    "cbam_sector_id" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."ghg_industry_segments" enable row level security;


  create table "public"."ghg_intensity_metrics" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "fy_year" text not null,
    "metric_type" text not null,
    "numerator_tco2e" numeric not null,
    "denominator_value" numeric not null,
    "denominator_unit" text not null,
    "intensity_value" numeric generated always as ((numerator_tco2e / NULLIF(denominator_value, (0)::numeric))) stored,
    "scope_coverage" integer[] not null,
    "notes" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."ghg_intensity_metrics" enable row level security;


  create table "public"."ghg_internal_audits" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "fy_year" text not null,
    "audit_scope" text not null,
    "audit_date" date not null,
    "auditor_name" text not null,
    "auditor_role" text not null,
    "nonconformities_found" integer default 0,
    "observations" text,
    "recommendations" text,
    "audit_report_url" text,
    "created_at" timestamp with time zone default now(),
    "created_by" uuid
      );


alter table "public"."ghg_internal_audits" enable row level security;


  create table "public"."ghg_management_reviews" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "fy_year" text not null,
    "review_date" date not null,
    "reviewed_by_name" text not null,
    "reviewed_by_designation" text not null,
    "issues_identified" text,
    "corrective_actions" text,
    "improvement_actions" text,
    "approved_inventory_version" text,
    "review_notes" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."ghg_management_reviews" enable row level security;


  create table "public"."ghg_ml_features" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "site_id" uuid,
    "field_key" text not null,
    "month" integer not null,
    "year" integer not null,
    "fy_year" text not null,
    "value_raw" numeric,
    "value_normalized" numeric,
    "rolling_avg_3m" numeric,
    "rolling_avg_12m" numeric,
    "yoy_change_pct" numeric,
    "mom_change_pct" numeric,
    "seasonality_index" numeric,
    "trend_component" numeric,
    "residual_component" numeric,
    "site_area_sqm" numeric,
    "employee_count" integer,
    "production_units" numeric,
    "revenue_cr" numeric,
    "weather_hdd" numeric,
    "weather_cdd" numeric,
    "predicted_next_month" numeric,
    "prediction_confidence" numeric,
    "model_id" uuid,
    "features_computed_at" timestamp with time zone default now()
      );


alter table "public"."ghg_ml_features" enable row level security;


  create table "public"."ghg_monthly_readings" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "legal_entity_id" uuid,
    "site_id" uuid,
    "asset_id" uuid,
    "source_register_id" uuid,
    "submission_id" uuid,
    "activity_data_id" uuid,
    "month" integer not null,
    "year" integer not null,
    "fy_year" text not null,
    "field_key" text not null,
    "field_label" text not null,
    "scope" integer not null,
    "scope3_category" integer,
    "value" numeric not null default 0,
    "unit" text not null,
    "emission_factor_id" uuid,
    "ef_factor_code" text,
    "ef_factor_version" text,
    "ef_kgco2e_per_unit" numeric,
    "ef_locked_at" timestamp with time zone default now(),
    "ef_gwp_basis" text default 'AR6'::text,
    "kgco2_fossil" numeric default 0,
    "kgco2_biogenic" numeric default 0,
    "kgch4" numeric default 0,
    "kgn2o" numeric default 0,
    "kghfc" numeric default 0,
    "kgpfc" numeric default 0,
    "kgsf6" numeric default 0,
    "kgnf3" numeric default 0,
    "kgco2e_total" numeric generated always as (((((((kgco2_fossil + (kgch4 * 29.8)) + (kgn2o * 273.0)) + kghfc) + kgpfc) + (kgsf6 * 24300.0)) + (kgnf3 * 17400.0))) stored,
    "kgco2e_biogenic_sep" numeric generated always as (kgco2_biogenic) stored,
    "trust_score" numeric(4,3),
    "risk_level" text default 'unscored'::text,
    "ai_validated" boolean default false,
    "ai_validation_id" uuid,
    "data_source_type" text not null default 'secondary_calculated'::text,
    "data_tier" text not null default 'Tier1'::text,
    "is_estimated" boolean not null default false,
    "estimation_method" text,
    "uncertainty_pct" numeric,
    "data_quality_score" integer,
    "anomaly_flag" boolean default false,
    "anomaly_reason" text,
    "status" text not null default 'draft'::text,
    "is_locked" boolean default false,
    "entered_by" uuid not null,
    "entered_at" timestamp with time zone not null default now(),
    "reviewed_by" uuid,
    "reviewed_at" timestamp with time zone,
    "approved_by" uuid,
    "approved_at" timestamp with time zone,
    "verified_by" uuid,
    "verified_at" timestamp with time zone,
    "erp_source_ref" text,
    "erp_sync_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."ghg_monthly_readings" enable row level security;


  create table "public"."ghg_notifications" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "recipient_user_id" uuid not null,
    "notification_type" text not null,
    "title" text not null,
    "message" text not null,
    "priority" text default 'normal'::text,
    "related_entity_type" text,
    "related_entity_id" uuid,
    "is_read" boolean default false,
    "read_at" timestamp with time zone,
    "channel" text default 'in_app'::text,
    "sent_at" timestamp with time zone,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."ghg_notifications" enable row level security;


  create table "public"."ghg_reading_amendments" (
    "id" uuid not null default gen_random_uuid(),
    "original_reading_id" uuid not null,
    "organization_id" uuid not null,
    "amendment_type" text not null,
    "amendment_reason" text not null,
    "old_value" numeric not null,
    "new_value" numeric not null,
    "old_kgco2e" numeric not null,
    "new_kgco2e" numeric not null,
    "change_pct" numeric generated always as (
CASE
    WHEN (old_kgco2e = (0)::numeric) THEN NULL::numeric
    ELSE round((((new_kgco2e - old_kgco2e) / old_kgco2e) * (100)::numeric), 4)
END) stored,
    "is_material" boolean generated always as ((abs(
CASE
    WHEN (old_kgco2e = (0)::numeric) THEN (0)::numeric
    ELSE (((new_kgco2e - old_kgco2e) / old_kgco2e) * (100)::numeric)
END) > (5)::numeric)) stored,
    "requires_reverification" boolean not null default false,
    "verifier_notified_at" timestamp with time zone,
    "supporting_doc_id" uuid,
    "amended_by" uuid not null,
    "amended_at" timestamp with time zone not null default now(),
    "approved_by" uuid
      );


alter table "public"."ghg_reading_amendments" enable row level security;


  create table "public"."ghg_reporting_boundaries" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "fy_year" text not null,
    "org_boundary_approach" text not null,
    "op_boundary_scope1" boolean not null default true,
    "op_boundary_scope2" boolean not null default true,
    "op_boundary_scope2_method" text default 'location_based'::text,
    "op_boundary_scope3" boolean not null default false,
    "scope3_categories_included" integer[],
    "scope3_exclusion_reasons" jsonb,
    "biogenic_co2_tracked" boolean default false,
    "gases_included" text[] default ARRAY['CO2'::text, 'CH4'::text, 'N2O'::text, 'HFCs'::text, 'PFCs'::text, 'SF6'::text, 'NF3'::text],
    "materiality_threshold_pct" numeric default 5,
    "approved_by_name" text not null,
    "approved_by_designation" text not null,
    "approved_at" timestamp with time zone not null,
    "consultant_id" uuid,
    "notes" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."ghg_reporting_boundaries" enable row level security;


  create table "public"."ghg_signoff_chain" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "submission_id" uuid not null,
    "signoff_stage" text not null,
    "signed_by_user_id" uuid not null,
    "signed_by_name" text not null,
    "signed_by_designation" text not null,
    "signed_by_role" text not null,
    "signed_at" timestamp with time zone not null default now(),
    "ip_address" inet,
    "declaration_text" text not null,
    "signature_hash" text not null,
    "is_valid" boolean default true,
    "notes" text
      );


alter table "public"."ghg_signoff_chain" enable row level security;


  create table "public"."ghg_submissions" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "fy_year" text not null,
    "status" text not null default 'draft'::text,
    "submitted_at" timestamp with time zone,
    "locked_at" timestamp with time zone,
    "verified_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "created_by" uuid
      );


alter table "public"."ghg_submissions" enable row level security;


  create table "public"."ghg_suppliers" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "supplier_name" text not null,
    "supplier_gstin" text,
    "supplier_country" text default 'IN'::text,
    "supplier_sector" text,
    "scope3_category" integer,
    "annual_spend_inr" numeric,
    "spend_based_ef_kgco2e_per_inr" numeric,
    "supplier_reported_scope1_tco2e" numeric,
    "supplier_reported_scope2_tco2e" numeric,
    "supplier_reporting_standard" text,
    "supplier_verification_status" text default 'none'::text,
    "supplier_rating" text default 'unrated'::text,
    "ai_risk_score" numeric(4,3),
    "ai_risk_level" text default 'unscored'::text,
    "data_collection_year" integer,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."ghg_suppliers" enable row level security;


  create table "public"."ghg_targets" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "target_name" text not null,
    "target_type" text not null,
    "base_year" text not null,
    "target_year" integer not null,
    "reduction_pct" numeric not null,
    "scopes_covered" integer[] not null,
    "intensity_metric" text,
    "methodology" text,
    "is_sbti_aligned" boolean default false,
    "sbti_submission_date" date,
    "sbti_approval_date" date,
    "is_net_zero" boolean default false,
    "approved_by" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."ghg_targets" enable row level security;


  create table "public"."ghg_uncertainty_analysis" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "source_register_id" uuid,
    "fy_year" text not null,
    "uncertainty_type" text not null,
    "uncertainty_pct" numeric not null,
    "distribution_type" text,
    "calculation_method" text not null,
    "monte_carlo_runs" integer,
    "confidence_interval_pct" numeric default 95,
    "confidence_interval_low" numeric,
    "confidence_interval_high" numeric,
    "calculated_by" uuid,
    "calculated_at" timestamp with time zone default now()
      );


alter table "public"."ghg_uncertainty_analysis" enable row level security;


  create table "public"."ghg_verification_findings" (
    "id" uuid not null default gen_random_uuid(),
    "verification_id" uuid not null,
    "finding_ref" text not null,
    "finding_type" text not null,
    "severity" text not null,
    "scope_affected" integer,
    "field_key_affected" text,
    "affected_reading_ids" uuid[],
    "finding_description" text not null,
    "estimated_impact_tco2e" numeric,
    "standard_clause_ref" text,
    "raised_at" timestamp with time zone not null default now(),
    "status" text default 'open'::text,
    "resolved_at" timestamp with time zone
      );


alter table "public"."ghg_verification_findings" enable row level security;


  create table "public"."ghg_verification_responses" (
    "id" uuid not null default gen_random_uuid(),
    "finding_id" uuid not null,
    "response_text" text not null,
    "corrective_action" text,
    "amended_reading_ids" uuid[],
    "supporting_doc_id" uuid,
    "responded_by" uuid not null,
    "responded_at" timestamp with time zone not null default now(),
    "verifier_accepted" boolean,
    "verifier_accepted_at" timestamp with time zone
      );


alter table "public"."ghg_verification_responses" enable row level security;


  create table "public"."ghg_verifications" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "submission_id" uuid not null,
    "fy_year" text not null,
    "verifier_id" uuid not null,
    "verifier_organization" text not null,
    "verifier_accreditation_no" text,
    "verifier_standard" text not null default 'ISO 14064-3:2019'::text,
    "verifier_independence_dec" text not null,
    "assurance_level" text not null,
    "scopes_verified" integer[] not null,
    "materiality_threshold_pct" numeric not null default 5,
    "period_start" date not null,
    "period_end" date not null,
    "engagement_start_date" date,
    "desktop_review_date" date,
    "site_visit_dates" date[],
    "sites_visited" uuid[],
    "draft_statement_date" date,
    "final_statement_date" date,
    "verification_opinion" text,
    "total_verified_tco2e" numeric,
    "material_misstatement_found" boolean default false,
    "status" text not null default 'planned'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."ghg_verifications" enable row level security;


  create table "public"."gwp_factors" (
    "id" uuid not null default gen_random_uuid(),
    "gas_id" text not null,
    "gas_name" text not null,
    "chemical_formula" text,
    "cas_number" text,
    "gwp_100yr" numeric not null,
    "gwp_20yr" numeric,
    "gwp_basis" text not null default 'AR6'::text,
    "odp" numeric default 0,
    "is_kyoto_gas" boolean default true,
    "is_f_gas" boolean default false,
    "is_ods" boolean default false,
    "source_ref" text not null,
    "notes" text
      );


alter table "public"."gwp_factors" enable row level security;


  create table "public"."india_grid_zones" (
    "id" text not null,
    "name" text not null,
    "states" text[],
    "ef_kgco2_per_kwh" numeric not null,
    "ef_year" integer not null,
    "source_ref" text not null
      );


alter table "public"."india_grid_zones" enable row level security;


  create table "public"."industry_benchmarks" (
    "id" uuid not null default gen_random_uuid(),
    "industry_segment_id" text not null,
    "fy_year" text not null,
    "scope" integer not null,
    "metric_type" text not null,
    "benchmark_p25" numeric,
    "benchmark_p50" numeric,
    "benchmark_p75" numeric,
    "benchmark_p90" numeric,
    "sample_size" integer,
    "data_source" text not null,
    "applicable_region" text default 'IN'::text,
    "notes" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."industry_benchmarks" enable row level security;


  create table "public"."leads" (
    "id" uuid not null default gen_random_uuid(),
    "email" text not null,
    "sector" text,
    "product_label" text,
    "cn_code" text,
    "tonnage_per_year" numeric,
    "eua_price" numeric,
    "cost_2026_eur" numeric,
    "cost_2034_eur" numeric,
    "saving_2034_eur" numeric,
    "cumulative_saving_eur" numeric,
    "created_at" timestamp with time zone default now(),
    "consent_accepted" boolean not null default false,
    "ip_address" inet,
    "source" text,
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."leads" enable row level security;


  create table "public"."mfa_enforcement_config" (
    "id" uuid not null default gen_random_uuid(),
    "role_name" text not null,
    "mfa_required" boolean not null default true,
    "grace_period_days" integer not null default 7,
    "enforcement_start_dt" date,
    "bypass_allowed" boolean not null default false,
    "bypass_reason" text,
    "notes" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."mfa_enforcement_config" enable row level security;


  create table "public"."platform_permissions" (
    "id" uuid not null default gen_random_uuid(),
    "permission_code" text not null,
    "category" text not null,
    "description" text
      );


alter table "public"."platform_permissions" enable row level security;


  create table "public"."platform_roles" (
    "id" uuid not null default gen_random_uuid(),
    "role_name" text not null,
    "role_level" text not null,
    "description" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."platform_roles" enable row level security;


  create table "public"."product_emissions" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "product_id" text,
    "facility_id" uuid,
    "reporting_period" date not null,
    "fy_year" text not null,
    "embedded_emissions" numeric not null,
    "production_volume" numeric,
    "production_unit" text,
    "total_emissions" numeric,
    "method" text not null default 'direct_attribution'::text,
    "scope1_share" numeric,
    "scope2_share" numeric,
    "scope3_share" numeric,
    "cn_code" text,
    "exported_to_eu" boolean default false,
    "cbam_year" integer,
    "default_value_used" boolean default false,
    "is_verified" boolean default false,
    "verified_by" uuid,
    "ai_calculated" boolean default false,
    "model_id" uuid,
    "confidence" numeric(4,3),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."product_emissions" enable row level security;


  create table "public"."rate_limit_config" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid,
    "endpoint_pattern" text not null,
    "limit_per_minute" integer not null default 60,
    "limit_per_hour" integer not null default 1000,
    "limit_per_day" integer not null default 10000,
    "burst_allowance" integer default 10,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."rate_limit_config" enable row level security;


  create table "public"."regulatory_filings" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "framework_id" text not null,
    "fy_year" text not null,
    "filing_type" text not null,
    "due_date" date not null,
    "filing_window_opens" date,
    "portal_url" text,
    "status" text not null default 'not_started'::text,
    "submitted_at" timestamp with time zone,
    "accepted_at" timestamp with time zone,
    "filing_reference" text,
    "submission_doc_id" uuid,
    "responsible_person" text,
    "responsible_email" text,
    "notes" text,
    "reminder_sent_30d" boolean default false,
    "reminder_sent_7d" boolean default false,
    "reminder_sent_1d" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."regulatory_filings" enable row level security;


  create table "public"."role_permissions" (
    "role_id" uuid not null,
    "permission_id" uuid not null
      );


alter table "public"."role_permissions" enable row level security;


  create table "public"."ropa_entries" (
    "id" uuid not null default gen_random_uuid(),
    "activity_name" text not null,
    "controller_name" text not null default 'GHG Platform'::text,
    "controller_contact" text,
    "dpo_contact" text,
    "processing_purpose" text not null,
    "legal_basis" text not null,
    "data_subject_categories" text[] not null,
    "personal_data_categories" text[] not null,
    "data_recipients" text[],
    "third_country_transfers" text,
    "safeguards_for_transfers" text,
    "retention_period" text not null,
    "retention_legal_reference" text,
    "security_measures" text,
    "automated_decision_making" boolean not null default false,
    "profiling_involved" boolean not null default false,
    "sensitive_data_categories" text[],
    "applicable_tables" text[],
    "is_active" boolean not null default true,
    "last_reviewed_at" timestamp with time zone,
    "next_review_due" timestamp with time zone,
    "gdpr_applicable" boolean not null default true,
    "ccpa_applicable" boolean not null default false,
    "dpdp_applicable" boolean not null default false,
    "notes" text,
    "created_by" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."ropa_entries" enable row level security;


  create table "public"."sbti_milestones" (
    "id" uuid not null default gen_random_uuid(),
    "target_id" uuid not null,
    "organization_id" uuid not null,
    "milestone_year" integer not null,
    "required_tco2e" numeric not null,
    "actual_tco2e" numeric,
    "variance_tco2e" numeric generated always as (
CASE
    WHEN (actual_tco2e IS NULL) THEN NULL::numeric
    ELSE (actual_tco2e - required_tco2e)
END) stored,
    "status" text default 'pending'::text,
    "notes" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."sbti_milestones" enable row level security;


  create table "public"."scope3_categories" (
    "id" smallint not null,
    "name" text not null,
    "direction" text not null,
    "description" text,
    "typical_methods" text[]
      );


alter table "public"."scope3_categories" enable row level security;


  create table "public"."sector_field_templates" (
    "id" uuid not null default gen_random_uuid(),
    "segment_id" text not null,
    "field_key" text not null,
    "field_label" text not null,
    "field_description" text,
    "input_type" text not null,
    "unit_options" text[],
    "default_unit" text,
    "scope" integer not null,
    "scope3_category" integer,
    "gas_category" text,
    "emission_factor_id" uuid,
    "is_required" boolean default false,
    "is_hazmat" boolean default false,
    "validation_min" numeric,
    "validation_max" numeric,
    "display_order" integer default 0,
    "visible_to_roles" text[] default ARRAY['data_entry_operator'::text, 'facility_manager'::text],
    "help_text" text,
    "erp_field_mapping" text,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."sector_field_templates" enable row level security;


  create table "public"."security_incidents" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid,
    "incident_ref" text,
    "title" text not null,
    "incident_type" text not null,
    "severity" text not null,
    "status" text not null default 'detected'::text,
    "description" text,
    "root_cause" text,
    "remediation_steps" text,
    "lessons_learned" text,
    "affected_tables" text[],
    "affected_user_count" integer default 0,
    "affected_org_ids" uuid[],
    "personal_data_involved" boolean not null default false,
    "personal_data_categories" text[],
    "detected_at" timestamp with time zone not null default now(),
    "reported_internally_at" timestamp with time zone,
    "contained_at" timestamp with time zone,
    "resolved_at" timestamp with time zone,
    "dpa_notification_required" boolean not null default false,
    "dpa_notification_deadline" timestamp with time zone,
    "dpa_notified_at" timestamp with time zone,
    "dpa_notification_ref" text,
    "dpa_72h_sla_met" boolean,
    "user_notification_required" boolean not null default false,
    "user_notifications_sent_at" timestamp with time zone,
    "reported_by" uuid,
    "assigned_to" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."security_incidents" enable row level security;


  create table "public"."supplier_emissions" (
    "id" uuid not null default gen_random_uuid(),
    "supplier_id" uuid not null,
    "organization_id" uuid not null,
    "product_id" text,
    "reporting_period" date not null,
    "fy_year" text not null,
    "estimated_emissions" numeric not null,
    "emission_unit" text default 'tCO2e'::text,
    "calculation_method" text not null,
    "data_source" text not null,
    "emission_factor_id" uuid,
    "is_verified" boolean default false,
    "ai_estimated" boolean default false,
    "model_id" uuid,
    "confidence" numeric(4,3),
    "created_at" timestamp with time zone default now()
      );


alter table "public"."supplier_emissions" enable row level security;


  create table "public"."user_organization_roles" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "organization_id" uuid not null,
    "role_id" uuid not null,
    "assigned_by" uuid,
    "assigned_at" timestamp with time zone default now(),
    "is_active" boolean default true,
    "notes" text
      );


alter table "public"."user_organization_roles" enable row level security;


  create table "public"."user_sessions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "organization_id" uuid,
    "session_token_hash" text not null,
    "device_fingerprint" text,
    "device_type" text,
    "browser" text,
    "os" text,
    "ip_address" inet,
    "country_code" text,
    "city" text,
    "login_at" timestamp with time zone not null default now(),
    "last_active_at" timestamp with time zone not null default now(),
    "logout_at" timestamp with time zone,
    "force_logged_out_at" timestamp with time zone,
    "force_logout_by" uuid,
    "force_logout_reason" text,
    "is_active" boolean default true,
    "mfa_verified" boolean default false,
    "risk_score" numeric(4,3)
      );


alter table "public"."user_sessions" enable row level security;


  create table "public"."vendor_security_assessments" (
    "id" uuid not null default gen_random_uuid(),
    "vendor_name" text not null,
    "vendor_type" text not null,
    "service_description" text,
    "website_url" text,
    "data_access_level" text not null,
    "personal_data_shared" boolean not null default false,
    "personal_data_categories" text[],
    "data_residency_region" text,
    "soc2_type2_available" boolean not null default false,
    "soc2_report_date" date,
    "soc2_report_path" text,
    "iso27001_certified" boolean not null default false,
    "iso27001_cert_expiry" date,
    "gdpr_dpa_signed" boolean not null default false,
    "gdpr_dpa_date" date,
    "nda_signed" boolean not null default false,
    "inherent_risk_level" text not null default 'medium'::text,
    "residual_risk_level" text,
    "last_assessment_date" date,
    "next_assessment_due" date,
    "assessment_notes" text,
    "compensating_controls" text,
    "is_active" boolean not null default true,
    "created_by" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."vendor_security_assessments" enable row level security;


  create table "public"."verifiers" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "full_name" text not null,
    "email" text not null,
    "organization_name" text not null,
    "accreditation_no" text,
    "accreditation_body" text,
    "standard_competence" text[],
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "deleted_at" timestamp with time zone
      );


alter table "public"."verifiers" enable row level security;


  create table "public"."webhook_delivery_log" (
    "id" uuid not null default gen_random_uuid(),
    "subscription_id" uuid not null,
    "organization_id" uuid not null,
    "event_type" text not null,
    "event_payload" jsonb not null,
    "attempt_number" integer not null default 1,
    "status_code" integer,
    "response_body" text,
    "delivery_duration_ms" integer,
    "succeeded" boolean default false,
    "error_message" text,
    "next_retry_at" timestamp with time zone,
    "delivered_at" timestamp with time zone default now()
      );


alter table "public"."webhook_delivery_log" enable row level security;


  create table "public"."webhook_subscriptions" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "webhook_name" text not null,
    "endpoint_url" text not null,
    "secret_hmac" text not null,
    "event_types" text[] not null,
    "is_active" boolean default true,
    "max_retries" integer default 3,
    "retry_delay_seconds" integer default 60,
    "timeout_seconds" integer default 30,
    "last_triggered_at" timestamp with time zone,
    "last_status_code" integer,
    "failure_count" integer default 0,
    "disabled_at" timestamp with time zone,
    "created_by" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."webhook_subscriptions" enable row level security;

alter table "public"."activity_data" drop column "activity_date";

alter table "public"."activity_data" drop column "description";

alter table "public"."activity_data" drop column "source_id";

alter table "public"."activity_data" add column "activity_type" text not null;

alter table "public"."activity_data" add column "ai_validated" boolean default false;

alter table "public"."activity_data" add column "ai_validation_id" uuid;

alter table "public"."activity_data" add column "asset_id" uuid;

alter table "public"."activity_data" add column "created_by" uuid not null;

alter table "public"."activity_data" add column "data_source" text not null default 'manual_entry'::text;

alter table "public"."activity_data" add column "document_id" uuid;

alter table "public"."activity_data" add column "erp_transaction_id" text;

alter table "public"."activity_data" add column "facility_id" uuid;

alter table "public"."activity_data" add column "field_key" text;

alter table "public"."activity_data" add column "fuel_type" text;

alter table "public"."activity_data" add column "fy_year" text;

alter table "public"."activity_data" add column "month" integer;

alter table "public"."activity_data" add column "reporting_period" date not null;

alter table "public"."activity_data" add column "risk_level" text default 'unscored'::text;

alter table "public"."activity_data" add column "source_ref" text;

alter table "public"."activity_data" add column "status" text not null default 'pending'::text;

alter table "public"."activity_data" add column "trust_score" numeric(4,3);

alter table "public"."activity_data" add column "updated_at" timestamp with time zone default now();

alter table "public"."activity_data" add column "year" integer;

alter table "public"."emission_factor_sources" drop column "created_at";

alter table "public"."emission_factor_sources" drop column "id";

alter table "public"."emission_factor_sources" drop column "url";

alter table "public"."emission_factor_sources" add column "applicable_region" text[] default ARRAY['GLOBAL'::text];

alter table "public"."emission_factor_sources" add column "license" text;

alter table "public"."emission_factor_sources" add column "notes" text;

alter table "public"."emission_factor_sources" add column "publication_url" text;

alter table "public"."emission_factor_sources" add column "publisher" text not null;

alter table "public"."emission_factor_sources" add column "source_code" text not null;

alter table "public"."emission_factor_sources" alter column "publication_year" set not null;

alter table "public"."emission_factor_sources" enable row level security;

alter table "public"."emission_factors" drop column "factor_value";

alter table "public"."emission_factors" drop column "gas_type";

alter table "public"."emission_factors" drop column "source_id";

alter table "public"."emission_factors" drop column "unit";

alter table "public"."emission_factors" add column "activity_category" text not null;

alter table "public"."emission_factors" add column "activity_detail" text;

alter table "public"."emission_factors" add column "activity_unit" text not null;

alter table "public"."emission_factors" add column "applicable_region" text default 'IN'::text;

alter table "public"."emission_factors" add column "applicable_segment" text[];

alter table "public"."emission_factors" add column "created_by" uuid;

alter table "public"."emission_factors" add column "deleted_at" timestamp with time zone;

alter table "public"."emission_factors" add column "embedding" extensions.vector(1536);

alter table "public"."emission_factors" add column "embedding_ready" boolean default false;

alter table "public"."emission_factors" add column "factor_code" text not null;

alter table "public"."emission_factors" add column "factor_version" text not null default 'v1'::text;

alter table "public"."emission_factors" add column "grid_zone" text;

alter table "public"."emission_factors" add column "gwp_basis" text not null default 'AR6'::text;

alter table "public"."emission_factors" add column "is_current" boolean default true;

alter table "public"."emission_factors" add column "is_superseded" boolean default false;

alter table "public"."emission_factors" add column "kgch4_per_unit" numeric;

alter table "public"."emission_factors" add column "kgco2_per_unit" numeric;

alter table "public"."emission_factors" add column "kgco2e_per_unit" numeric not null;

alter table "public"."emission_factors" add column "kgn2o_per_unit" numeric;

alter table "public"."emission_factors" add column "methodology_id" uuid;

alter table "public"."emission_factors" add column "scope" integer not null;

alter table "public"."emission_factors" add column "scope3_category" integer;

alter table "public"."emission_factors" add column "source_code" text;

alter table "public"."emission_factors" add column "source_table_ref" text;

alter table "public"."emission_factors" add column "superseded_by_id" uuid;

alter table "public"."emission_factors" add column "uncertainty_pct" numeric;

alter table "public"."emission_factors" alter column "valid_from" set not null;

alter table "public"."emission_factors" enable row level security;

alter table "public"."ghg_audit_log" drop column "action";

alter table "public"."ghg_audit_log" drop column "changed_at";

alter table "public"."ghg_audit_log" drop column "changed_by";

alter table "public"."ghg_audit_log" drop column "row_id";

alter table "public"."ghg_audit_log" add column "change_reason" text;

alter table "public"."ghg_audit_log" add column "changed_by_ip" inet;

alter table "public"."ghg_audit_log" add column "changed_by_role" text;

alter table "public"."ghg_audit_log" add column "changed_by_user_id" uuid;

alter table "public"."ghg_audit_log" add column "changed_fields" text[];

alter table "public"."ghg_audit_log" add column "event_hash" text;

alter table "public"."ghg_audit_log" add column "event_timestamp" timestamp with time zone not null default now();

alter table "public"."ghg_audit_log" add column "is_post_lock_change" boolean default false;

alter table "public"."ghg_audit_log" add column "operation" text not null;

alter table "public"."ghg_audit_log" add column "organization_id" uuid;

alter table "public"."ghg_audit_log" add column "previous_hash" text;

alter table "public"."ghg_audit_log" add column "record_id" uuid;

alter table "public"."ghg_audit_log" add column "session_id" text;

alter table "public"."ghg_audit_log" add column "user_agent" text;

alter table "public"."ghg_audit_log" add column "verification_stage" text;

alter table "public"."ghg_audit_log" enable row level security;

CREATE UNIQUE INDEX ai_models_model_name_version_key ON public.ai_models USING btree (model_name, version);

CREATE UNIQUE INDEX ai_models_pkey ON public.ai_models USING btree (id);

CREATE UNIQUE INDEX ai_validation_pkey ON public.ai_validation USING btree (id);

CREATE UNIQUE INDEX api_keys_key_hash_key ON public.api_keys USING btree (key_hash);

CREATE UNIQUE INDEX api_keys_pkey ON public.api_keys USING btree (id);

CREATE UNIQUE INDEX carbon_offset_registries_pkey ON public.carbon_offset_registries USING btree (id);

CREATE UNIQUE INDEX carbon_offsets_pkey ON public.carbon_offsets USING btree (id);

CREATE UNIQUE INDEX client_assets_pkey ON public.client_assets USING btree (id);

CREATE UNIQUE INDEX client_legal_entities_pkey ON public.client_legal_entities USING btree (id);

CREATE UNIQUE INDEX client_organizations_cin_key ON public.client_organizations USING btree (cin);

CREATE UNIQUE INDEX client_organizations_pkey ON public.client_organizations USING btree (id);

CREATE UNIQUE INDEX client_sites_pkey ON public.client_sites USING btree (id);

CREATE UNIQUE INDEX consent_records_pkey ON public.consent_records USING btree (id);

CREATE UNIQUE INDEX consultants_email_key ON public.consultants USING btree (email);

CREATE UNIQUE INDEX consultants_pkey ON public.consultants USING btree (id);

CREATE UNIQUE INDEX consultants_user_id_key ON public.consultants USING btree (user_id);

CREATE UNIQUE INDEX consumer_data_requests_pkey ON public.consumer_data_requests USING btree (id);

CREATE UNIQUE INDEX data_portability_exports_pkey ON public.data_portability_exports USING btree (id);

CREATE UNIQUE INDEX data_quality_audit_pkey ON public.data_quality_audit USING btree (id);

CREATE UNIQUE INDEX data_retention_policies_entity_type_key ON public.data_retention_policies USING btree (entity_type);

CREATE UNIQUE INDEX data_retention_policies_pkey ON public.data_retention_policies USING btree (id);

CREATE UNIQUE INDEX data_sale_opt_outs_pkey ON public.data_sale_opt_outs USING btree (id);

CREATE UNIQUE INDEX data_subject_access_requests_pkey ON public.data_subject_access_requests USING btree (id);

CREATE UNIQUE INDEX disclosure_frameworks_pkey ON public.disclosure_frameworks USING btree (id);

CREATE UNIQUE INDEX dpdp_erasure_requests_pkey ON public.dpdp_erasure_requests USING btree (id);

CREATE UNIQUE INDEX emission_factor_versions_pkey ON public.emission_factor_versions USING btree (id);

CREATE UNIQUE INDEX emission_factors_factor_code_factor_version_key ON public.emission_factors USING btree (factor_code, factor_version);

CREATE UNIQUE INDEX erp_connection_vault_pkey ON public.erp_connection_vault USING btree (id);

CREATE UNIQUE INDEX erp_field_mappings_pkey ON public.erp_field_mappings USING btree (id);

CREATE UNIQUE INDEX erp_sync_logs_pkey ON public.erp_sync_logs USING btree (id);

CREATE UNIQUE INDEX erp_systems_organization_id_key ON public.erp_systems USING btree (organization_id);

CREATE UNIQUE INDEX erp_systems_pkey ON public.erp_systems USING btree (id);

CREATE UNIQUE INDEX feature_flags_flag_key_key ON public.feature_flags USING btree (flag_key);

CREATE UNIQUE INDEX feature_flags_pkey ON public.feature_flags USING btree (id);

CREATE UNIQUE INDEX fleet_monthly_logs_pkey ON public.fleet_monthly_logs USING btree (id);

CREATE UNIQUE INDEX fleet_monthly_logs_vehicle_id_month_year_key ON public.fleet_monthly_logs USING btree (vehicle_id, month, year);

CREATE UNIQUE INDEX fleet_vehicles_organization_id_registration_number_key ON public.fleet_vehicles USING btree (organization_id, registration_number);

CREATE UNIQUE INDEX fleet_vehicles_pkey ON public.fleet_vehicles USING btree (id);

CREATE UNIQUE INDEX framework_disclosures_organization_id_framework_id_indicato_key ON public.framework_disclosures USING btree (organization_id, framework_id, indicator_id, fy_year);

CREATE UNIQUE INDEX framework_disclosures_pkey ON public.framework_disclosures USING btree (id);

CREATE UNIQUE INDEX framework_indicators_framework_id_indicator_code_key ON public.framework_indicators USING btree (framework_id, indicator_code);

CREATE UNIQUE INDEX framework_indicators_pkey ON public.framework_indicators USING btree (id);

CREATE UNIQUE INDEX ghg_anomaly_flags_pkey ON public.ghg_anomaly_flags USING btree (id);

CREATE UNIQUE INDEX ghg_base_year_recalculations_pkey ON public.ghg_base_year_recalculations USING btree (id);

CREATE UNIQUE INDEX ghg_base_years_organization_id_key ON public.ghg_base_years USING btree (organization_id);

CREATE UNIQUE INDEX ghg_base_years_pkey ON public.ghg_base_years USING btree (id);

CREATE UNIQUE INDEX ghg_calculation_methodologies_pkey ON public.ghg_calculation_methodologies USING btree (id);

CREATE UNIQUE INDEX ghg_corrective_actions_pkey ON public.ghg_corrective_actions USING btree (id);

CREATE UNIQUE INDEX ghg_data_quality_assessments_pkey ON public.ghg_data_quality_assessments USING btree (id);

CREATE UNIQUE INDEX ghg_documents_pkey ON public.ghg_documents USING btree (id);

CREATE UNIQUE INDEX ghg_emission_source_register_pkey ON public.ghg_emission_source_register USING btree (id);

CREATE UNIQUE INDEX ghg_exclusion_register_pkey ON public.ghg_exclusion_register USING btree (id);

CREATE UNIQUE INDEX ghg_hazardous_consumables_pkey ON public.ghg_hazardous_consumables USING btree (id);

CREATE UNIQUE INDEX ghg_industry_segments_pkey ON public.ghg_industry_segments USING btree (id);

CREATE UNIQUE INDEX ghg_intensity_metrics_pkey ON public.ghg_intensity_metrics USING btree (id);

CREATE UNIQUE INDEX ghg_internal_audits_pkey ON public.ghg_internal_audits USING btree (id);

CREATE UNIQUE INDEX ghg_management_reviews_pkey ON public.ghg_management_reviews USING btree (id);

CREATE UNIQUE INDEX ghg_ml_features_pkey ON public.ghg_ml_features USING btree (id);

CREATE UNIQUE INDEX ghg_monthly_readings_organization_id_site_id_field_key_mont_key ON public.ghg_monthly_readings USING btree (organization_id, site_id, field_key, month, year);

CREATE UNIQUE INDEX ghg_monthly_readings_pkey ON public.ghg_monthly_readings USING btree (id);

CREATE UNIQUE INDEX ghg_notifications_pkey ON public.ghg_notifications USING btree (id);

CREATE UNIQUE INDEX ghg_reading_amendments_pkey ON public.ghg_reading_amendments USING btree (id);

CREATE UNIQUE INDEX ghg_reporting_boundaries_organization_id_fy_year_key ON public.ghg_reporting_boundaries USING btree (organization_id, fy_year);

CREATE UNIQUE INDEX ghg_reporting_boundaries_pkey ON public.ghg_reporting_boundaries USING btree (id);

CREATE UNIQUE INDEX ghg_signoff_chain_pkey ON public.ghg_signoff_chain USING btree (id);

CREATE UNIQUE INDEX ghg_submissions_organization_id_fy_year_key ON public.ghg_submissions USING btree (organization_id, fy_year);

CREATE UNIQUE INDEX ghg_submissions_pkey ON public.ghg_submissions USING btree (id);

CREATE UNIQUE INDEX ghg_suppliers_pkey ON public.ghg_suppliers USING btree (id);

CREATE UNIQUE INDEX ghg_targets_pkey ON public.ghg_targets USING btree (id);

CREATE UNIQUE INDEX ghg_uncertainty_analysis_pkey ON public.ghg_uncertainty_analysis USING btree (id);

CREATE UNIQUE INDEX ghg_verification_findings_pkey ON public.ghg_verification_findings USING btree (id);

CREATE UNIQUE INDEX ghg_verification_responses_pkey ON public.ghg_verification_responses USING btree (id);

CREATE UNIQUE INDEX ghg_verifications_pkey ON public.ghg_verifications USING btree (id);

CREATE UNIQUE INDEX gwp_factors_gas_id_key ON public.gwp_factors USING btree (gas_id);

CREATE UNIQUE INDEX gwp_factors_pkey ON public.gwp_factors USING btree (id);

CREATE INDEX idx_activity_facility ON public.activity_data USING btree (facility_id);

CREATE INDEX idx_activity_org_fy ON public.activity_data USING btree (organization_id, fy_year);

CREATE INDEX idx_activity_status ON public.activity_data USING btree (status);

CREATE INDEX idx_activity_unvalidated ON public.activity_data USING btree (organization_id) WHERE (ai_validated = false);

CREATE INDEX idx_aival_flagged ON public.ai_validation USING btree (organization_id) WHERE (flagged_for_audit = true);

CREATE INDEX idx_aival_org_status ON public.ai_validation USING btree (organization_id, validation_status);

CREATE INDEX idx_aival_record ON public.ai_validation USING btree (record_id, table_name);

CREATE INDEX idx_anomaly_org ON public.ghg_anomaly_flags USING btree (organization_id);

CREATE INDEX idx_anomaly_unresolved ON public.ghg_anomaly_flags USING btree (organization_id) WHERE (is_confirmed = false);

CREATE INDEX idx_api_keys_expiry ON public.api_keys USING btree (expires_at) WHERE (expires_at IS NOT NULL);

CREATE INDEX idx_api_keys_hash ON public.api_keys USING btree (key_hash);

CREATE INDEX idx_api_keys_org ON public.api_keys USING btree (organization_id) WHERE (is_active = true);

CREATE INDEX idx_api_keys_org_active ON public.api_keys USING btree (organization_id) WHERE (is_active = true);

CREATE INDEX idx_assets_org ON public.client_assets USING btree (organization_id);

CREATE INDEX idx_assets_site ON public.client_assets USING btree (site_id);

CREATE INDEX idx_auditlog_org ON public.ghg_audit_log USING btree (organization_id);

CREATE INDEX idx_auditlog_postlock ON public.ghg_audit_log USING btree (organization_id) WHERE (is_post_lock_change = true);

CREATE INDEX idx_auditlog_table ON public.ghg_audit_log USING btree (table_name);

CREATE INDEX idx_ccpa_email ON public.consumer_data_requests USING btree (requester_email);

CREATE INDEX idx_ccpa_status ON public.consumer_data_requests USING btree (status, due_at) WHERE (status <> ALL (ARRAY['fulfilled'::text, 'rejected'::text, 'withdrawn'::text]));

CREATE INDEX idx_consent_org_id ON public.consent_records USING btree (organization_id) WHERE (organization_id IS NOT NULL);

CREATE INDEX idx_consent_type_version ON public.consent_records USING btree (consent_type, policy_version);

CREATE INDEX idx_consent_user_id ON public.consent_records USING btree (user_id);

CREATE INDEX idx_consent_withdrawn ON public.consent_records USING btree (is_withdrawn, withdrawn_at) WHERE (is_withdrawn = true);

CREATE INDEX idx_disclosures_org_fw ON public.framework_disclosures USING btree (organization_id, framework_id, fy_year);

CREATE INDEX idx_docs_extraction ON public.ghg_documents USING btree (extraction_status) WHERE (extraction_status = ANY (ARRAY['pending'::text, 'queued'::text, 'processing'::text]));

CREATE INDEX idx_docs_org ON public.ghg_documents USING btree (organization_id);

CREATE INDEX idx_docs_reading ON public.ghg_documents USING btree (reading_id);

CREATE INDEX idx_docs_review ON public.ghg_documents USING btree (review_status) WHERE (review_status = 'pending'::text);

CREATE INDEX idx_dsar_email ON public.data_subject_access_requests USING btree (requester_email);

CREATE INDEX idx_dsar_org_id ON public.data_subject_access_requests USING btree (organization_id) WHERE (organization_id IS NOT NULL);

CREATE INDEX idx_dsar_status_due ON public.data_subject_access_requests USING btree (status, due_at) WHERE (status <> ALL (ARRAY['fulfilled'::text, 'rejected'::text, 'withdrawn'::text]));

CREATE INDEX idx_dsar_user_id ON public.data_subject_access_requests USING btree (user_id) WHERE (user_id IS NOT NULL);

CREATE INDEX idx_ef_code ON public.emission_factors USING btree (factor_code);

CREATE INDEX idx_ef_current ON public.emission_factors USING btree (factor_code) WHERE (is_current = true);

CREATE INDEX idx_ef_scope_region ON public.emission_factors USING btree (scope, applicable_region);

CREATE INDEX idx_ef_versions_code ON public.emission_factor_versions USING btree (factor_code);

CREATE INDEX idx_ef_versions_date ON public.emission_factor_versions USING btree (effective_date);

CREATE INDEX idx_ef_zone ON public.emission_factors USING btree (grid_zone) WHERE (grid_zone IS NOT NULL);

CREATE INDEX idx_erp_logs_org ON public.erp_sync_logs USING btree (organization_id);

CREATE INDEX idx_erp_mapping_field ON public.erp_field_mappings USING btree (ghg_field_key);

CREATE INDEX idx_filings_due ON public.regulatory_filings USING btree (due_date) WHERE (status <> ALL (ARRAY['submitted'::text, 'accepted'::text]));

CREATE INDEX idx_filings_org_due ON public.regulatory_filings USING btree (organization_id, due_date);

CREATE INDEX idx_filings_overdue ON public.regulatory_filings USING btree (due_date) WHERE (status <> ALL (ARRAY['submitted'::text, 'accepted'::text, 'waived'::text]));

CREATE INDEX idx_fleet_anomaly ON public.fleet_monthly_logs USING btree (organization_id) WHERE (anomaly_flag = true);

CREATE INDEX idx_fleet_logs_org_fy ON public.fleet_monthly_logs USING btree (organization_id, fy_year);

CREATE INDEX idx_fleet_logs_vehicle ON public.fleet_monthly_logs USING btree (vehicle_id, year, month);

CREATE INDEX idx_fleet_org_active ON public.fleet_vehicles USING btree (organization_id) WHERE (is_active = true);

CREATE INDEX idx_fleet_puc_expiry ON public.fleet_vehicles USING btree (puc_expiry);

CREATE INDEX idx_fleet_site ON public.fleet_vehicles USING btree (site_id);

CREATE INDEX idx_hazmat_cas ON public.ghg_hazardous_consumables USING btree (cas_number);

CREATE INDEX idx_hazmat_org_fy ON public.ghg_hazardous_consumables USING btree (organization_id, fy_year);

CREATE INDEX idx_incidents_dpa_deadline ON public.security_incidents USING btree (dpa_notification_deadline) WHERE ((dpa_notification_required = true) AND (dpa_notified_at IS NULL));

CREATE INDEX idx_incidents_org ON public.security_incidents USING btree (organization_id) WHERE (organization_id IS NOT NULL);

CREATE INDEX idx_incidents_severity ON public.security_incidents USING btree (severity, detected_at);

CREATE INDEX idx_incidents_status ON public.security_incidents USING btree (status) WHERE (status <> ALL (ARRAY['closed'::text, 'false_positive'::text]));

CREATE INDEX idx_leads_email_created ON public.leads USING btree (lower(email), created_at DESC);

CREATE INDEX idx_leads_ip_created ON public.leads USING btree (ip_address, created_at DESC) WHERE (ip_address IS NOT NULL);

CREATE INDEX idx_milestones_target ON public.sbti_milestones USING btree (target_id);

CREATE INDEX idx_mlf_org_field ON public.ghg_ml_features USING btree (organization_id, field_key, year, month);

CREATE INDEX idx_notif_unread ON public.ghg_notifications USING btree (recipient_user_id) WHERE (is_read = false);

CREATE INDEX idx_offsets_org ON public.carbon_offsets USING btree (organization_id);

CREATE INDEX idx_offsets_org_fy ON public.carbon_offsets USING btree (organization_id, fy_year_applied);

CREATE INDEX idx_offsets_retired ON public.carbon_offsets USING btree (organization_id) WHERE (is_retired = true);

CREATE INDEX idx_offsets_vintage ON public.carbon_offsets USING btree (vintage_year);

CREATE UNIQUE INDEX idx_opt_out_email ON public.data_sale_opt_outs USING btree (lower(email)) WHERE (is_opted_out = true);

CREATE INDEX idx_orgs_active ON public.client_organizations USING btree (is_active);

CREATE INDEX idx_orgs_segment ON public.client_organizations USING btree (industry_segment_id);

CREATE INDEX idx_portability_status ON public.data_portability_exports USING btree (status) WHERE (status = ANY (ARRAY['requested'::text, 'processing'::text, 'ready'::text]));

CREATE INDEX idx_portability_user ON public.data_portability_exports USING btree (user_id);

CREATE INDEX idx_product_emit_cn ON public.product_emissions USING btree (cn_code) WHERE (cn_code IS NOT NULL);

CREATE INDEX idx_product_emit_org ON public.product_emissions USING btree (organization_id, fy_year);

CREATE INDEX idx_readings_anomaly ON public.ghg_monthly_readings USING btree (organization_id, fy_year) WHERE (anomaly_flag = true);

CREATE INDEX idx_readings_ef ON public.ghg_monthly_readings USING btree (emission_factor_id);

CREATE INDEX idx_readings_estimated ON public.ghg_monthly_readings USING btree (organization_id, fy_year) WHERE (is_estimated = true);

CREATE INDEX idx_readings_locked ON public.ghg_monthly_readings USING btree (submission_id) WHERE (is_locked = true);

CREATE INDEX idx_readings_low_trust ON public.ghg_monthly_readings USING btree (organization_id) WHERE (trust_score < 0.6);

CREATE INDEX idx_readings_org_fy_field ON public.ghg_monthly_readings USING btree (organization_id, fy_year, field_key);

CREATE INDEX idx_readings_org_fy_scope ON public.ghg_monthly_readings USING btree (organization_id, fy_year, scope);

CREATE INDEX idx_readings_site_month ON public.ghg_monthly_readings USING btree (site_id, year, month);

CREATE INDEX idx_readings_status ON public.ghg_monthly_readings USING btree (status);

CREATE INDEX idx_readings_submission ON public.ghg_monthly_readings USING btree (submission_id);

CREATE INDEX idx_ropa_active ON public.ropa_entries USING btree (is_active);

CREATE INDEX idx_ropa_review ON public.ropa_entries USING btree (next_review_due) WHERE (is_active = true);

CREATE INDEX idx_sessions_org ON public.user_sessions USING btree (organization_id);

CREATE INDEX idx_sessions_token ON public.user_sessions USING btree (session_token_hash);

CREATE INDEX idx_sessions_user ON public.user_sessions USING btree (user_id) WHERE (is_active = true);

CREATE INDEX idx_sessions_user_active ON public.user_sessions USING btree (user_id) WHERE (is_active = true);

CREATE INDEX idx_sites_grid ON public.client_sites USING btree (grid_zone);

CREATE INDEX idx_sites_state ON public.client_sites USING btree (state);

CREATE INDEX idx_soft_del_orgs ON public.client_organizations USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);

CREATE INDEX idx_soft_del_sites ON public.client_sites USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);

CREATE INDEX idx_srcreq_org_fy ON public.ghg_emission_source_register USING btree (organization_id, fy_year);

CREATE INDEX idx_supplier_emissions ON public.supplier_emissions USING btree (supplier_id);

CREATE INDEX idx_supplier_org ON public.ghg_suppliers USING btree (organization_id);

CREATE INDEX idx_uor_active ON public.user_organization_roles USING btree (user_id) WHERE (is_active = true);

CREATE INDEX idx_uor_org ON public.user_organization_roles USING btree (organization_id);

CREATE INDEX idx_uor_user ON public.user_organization_roles USING btree (user_id);

CREATE INDEX idx_vendor_assessment_due ON public.vendor_security_assessments USING btree (next_assessment_due) WHERE (is_active = true);

CREATE INDEX idx_vendor_risk ON public.vendor_security_assessments USING btree (inherent_risk_level) WHERE (is_active = true);

CREATE INDEX idx_webhook_log_org_evt ON public.webhook_delivery_log USING btree (organization_id, event_type);

CREATE INDEX idx_webhook_log_retry ON public.webhook_delivery_log USING btree (next_retry_at) WHERE ((succeeded = false) AND (next_retry_at IS NOT NULL));

CREATE INDEX idx_webhook_log_sub ON public.webhook_delivery_log USING btree (subscription_id);

CREATE INDEX idx_webhook_sub_org ON public.webhook_subscriptions USING btree (organization_id) WHERE (is_active = true);

CREATE INDEX idx_webhooks_org_active ON public.webhook_subscriptions USING btree (organization_id) WHERE (is_active = true);

CREATE UNIQUE INDEX india_grid_zones_pkey ON public.india_grid_zones USING btree (id);

CREATE UNIQUE INDEX industry_benchmarks_industry_segment_id_fy_year_scope_metri_key ON public.industry_benchmarks USING btree (industry_segment_id, fy_year, scope, metric_type, applicable_region);

CREATE UNIQUE INDEX industry_benchmarks_pkey ON public.industry_benchmarks USING btree (id);

CREATE UNIQUE INDEX leads_pkey ON public.leads USING btree (id);

CREATE UNIQUE INDEX mfa_enforcement_config_pkey ON public.mfa_enforcement_config USING btree (id);

CREATE UNIQUE INDEX mfa_enforcement_config_role_name_key ON public.mfa_enforcement_config USING btree (role_name);

CREATE UNIQUE INDEX platform_permissions_permission_code_key ON public.platform_permissions USING btree (permission_code);

CREATE UNIQUE INDEX platform_permissions_pkey ON public.platform_permissions USING btree (id);

CREATE UNIQUE INDEX platform_roles_pkey ON public.platform_roles USING btree (id);

CREATE UNIQUE INDEX platform_roles_role_name_key ON public.platform_roles USING btree (role_name);

CREATE UNIQUE INDEX product_emissions_pkey ON public.product_emissions USING btree (id);

CREATE UNIQUE INDEX rate_limit_config_pkey ON public.rate_limit_config USING btree (id);

CREATE UNIQUE INDEX regulatory_filings_organization_id_framework_id_fy_year_key ON public.regulatory_filings USING btree (organization_id, framework_id, fy_year);

CREATE UNIQUE INDEX regulatory_filings_pkey ON public.regulatory_filings USING btree (id);

CREATE UNIQUE INDEX role_permissions_pkey ON public.role_permissions USING btree (role_id, permission_id);

CREATE UNIQUE INDEX ropa_entries_pkey ON public.ropa_entries USING btree (id);

CREATE UNIQUE INDEX sbti_milestones_pkey ON public.sbti_milestones USING btree (id);

CREATE UNIQUE INDEX sbti_milestones_target_id_milestone_year_key ON public.sbti_milestones USING btree (target_id, milestone_year);

CREATE UNIQUE INDEX scope3_categories_pkey ON public.scope3_categories USING btree (id);

CREATE UNIQUE INDEX sector_field_templates_pkey ON public.sector_field_templates USING btree (id);

CREATE UNIQUE INDEX sector_field_templates_segment_id_field_key_key ON public.sector_field_templates USING btree (segment_id, field_key);

CREATE UNIQUE INDEX security_incidents_pkey ON public.security_incidents USING btree (id);

CREATE UNIQUE INDEX supplier_emissions_pkey ON public.supplier_emissions USING btree (id);

CREATE UNIQUE INDEX uor_unique_user_org_role ON public.user_organization_roles USING btree (user_id, organization_id, role_id);

CREATE UNIQUE INDEX user_organization_roles_pkey ON public.user_organization_roles USING btree (id);

CREATE UNIQUE INDEX user_sessions_pkey ON public.user_sessions USING btree (id);

CREATE UNIQUE INDEX user_sessions_session_token_hash_key ON public.user_sessions USING btree (session_token_hash);

CREATE UNIQUE INDEX vendor_security_assessments_pkey ON public.vendor_security_assessments USING btree (id);

CREATE UNIQUE INDEX verifiers_email_key ON public.verifiers USING btree (email);

CREATE UNIQUE INDEX verifiers_pkey ON public.verifiers USING btree (id);

CREATE UNIQUE INDEX verifiers_user_id_key ON public.verifiers USING btree (user_id);

CREATE UNIQUE INDEX webhook_delivery_log_pkey ON public.webhook_delivery_log USING btree (id);

CREATE UNIQUE INDEX webhook_subscriptions_pkey ON public.webhook_subscriptions USING btree (id);

CREATE UNIQUE INDEX emission_factor_sources_pkey ON public.emission_factor_sources USING btree (source_code);

CREATE INDEX idx_sites_org ON public.client_sites USING btree (organization_id);

alter table "public"."ai_models" add constraint "ai_models_pkey" PRIMARY KEY using index "ai_models_pkey";

alter table "public"."ai_validation" add constraint "ai_validation_pkey" PRIMARY KEY using index "ai_validation_pkey";

alter table "public"."api_keys" add constraint "api_keys_pkey" PRIMARY KEY using index "api_keys_pkey";

alter table "public"."carbon_offset_registries" add constraint "carbon_offset_registries_pkey" PRIMARY KEY using index "carbon_offset_registries_pkey";

alter table "public"."carbon_offsets" add constraint "carbon_offsets_pkey" PRIMARY KEY using index "carbon_offsets_pkey";

alter table "public"."client_assets" add constraint "client_assets_pkey" PRIMARY KEY using index "client_assets_pkey";

alter table "public"."client_legal_entities" add constraint "client_legal_entities_pkey" PRIMARY KEY using index "client_legal_entities_pkey";

alter table "public"."client_organizations" add constraint "client_organizations_pkey" PRIMARY KEY using index "client_organizations_pkey";

alter table "public"."client_sites" add constraint "client_sites_pkey" PRIMARY KEY using index "client_sites_pkey";

alter table "public"."consent_records" add constraint "consent_records_pkey" PRIMARY KEY using index "consent_records_pkey";

alter table "public"."consultants" add constraint "consultants_pkey" PRIMARY KEY using index "consultants_pkey";

alter table "public"."consumer_data_requests" add constraint "consumer_data_requests_pkey" PRIMARY KEY using index "consumer_data_requests_pkey";

alter table "public"."data_portability_exports" add constraint "data_portability_exports_pkey" PRIMARY KEY using index "data_portability_exports_pkey";

alter table "public"."data_quality_audit" add constraint "data_quality_audit_pkey" PRIMARY KEY using index "data_quality_audit_pkey";

alter table "public"."data_retention_policies" add constraint "data_retention_policies_pkey" PRIMARY KEY using index "data_retention_policies_pkey";

alter table "public"."data_sale_opt_outs" add constraint "data_sale_opt_outs_pkey" PRIMARY KEY using index "data_sale_opt_outs_pkey";

alter table "public"."data_subject_access_requests" add constraint "data_subject_access_requests_pkey" PRIMARY KEY using index "data_subject_access_requests_pkey";

alter table "public"."disclosure_frameworks" add constraint "disclosure_frameworks_pkey" PRIMARY KEY using index "disclosure_frameworks_pkey";

alter table "public"."dpdp_erasure_requests" add constraint "dpdp_erasure_requests_pkey" PRIMARY KEY using index "dpdp_erasure_requests_pkey";

alter table "public"."emission_factor_versions" add constraint "emission_factor_versions_pkey" PRIMARY KEY using index "emission_factor_versions_pkey";

alter table "public"."erp_connection_vault" add constraint "erp_connection_vault_pkey" PRIMARY KEY using index "erp_connection_vault_pkey";

alter table "public"."erp_field_mappings" add constraint "erp_field_mappings_pkey" PRIMARY KEY using index "erp_field_mappings_pkey";

alter table "public"."erp_sync_logs" add constraint "erp_sync_logs_pkey" PRIMARY KEY using index "erp_sync_logs_pkey";

alter table "public"."erp_systems" add constraint "erp_systems_pkey" PRIMARY KEY using index "erp_systems_pkey";

alter table "public"."feature_flags" add constraint "feature_flags_pkey" PRIMARY KEY using index "feature_flags_pkey";

alter table "public"."fleet_monthly_logs" add constraint "fleet_monthly_logs_pkey" PRIMARY KEY using index "fleet_monthly_logs_pkey";

alter table "public"."fleet_vehicles" add constraint "fleet_vehicles_pkey" PRIMARY KEY using index "fleet_vehicles_pkey";

alter table "public"."framework_disclosures" add constraint "framework_disclosures_pkey" PRIMARY KEY using index "framework_disclosures_pkey";

alter table "public"."framework_indicators" add constraint "framework_indicators_pkey" PRIMARY KEY using index "framework_indicators_pkey";

alter table "public"."ghg_anomaly_flags" add constraint "ghg_anomaly_flags_pkey" PRIMARY KEY using index "ghg_anomaly_flags_pkey";

alter table "public"."ghg_base_year_recalculations" add constraint "ghg_base_year_recalculations_pkey" PRIMARY KEY using index "ghg_base_year_recalculations_pkey";

alter table "public"."ghg_base_years" add constraint "ghg_base_years_pkey" PRIMARY KEY using index "ghg_base_years_pkey";

alter table "public"."ghg_calculation_methodologies" add constraint "ghg_calculation_methodologies_pkey" PRIMARY KEY using index "ghg_calculation_methodologies_pkey";

alter table "public"."ghg_corrective_actions" add constraint "ghg_corrective_actions_pkey" PRIMARY KEY using index "ghg_corrective_actions_pkey";

alter table "public"."ghg_data_quality_assessments" add constraint "ghg_data_quality_assessments_pkey" PRIMARY KEY using index "ghg_data_quality_assessments_pkey";

alter table "public"."ghg_documents" add constraint "ghg_documents_pkey" PRIMARY KEY using index "ghg_documents_pkey";

alter table "public"."ghg_emission_source_register" add constraint "ghg_emission_source_register_pkey" PRIMARY KEY using index "ghg_emission_source_register_pkey";

alter table "public"."ghg_exclusion_register" add constraint "ghg_exclusion_register_pkey" PRIMARY KEY using index "ghg_exclusion_register_pkey";

alter table "public"."ghg_hazardous_consumables" add constraint "ghg_hazardous_consumables_pkey" PRIMARY KEY using index "ghg_hazardous_consumables_pkey";

alter table "public"."ghg_industry_segments" add constraint "ghg_industry_segments_pkey" PRIMARY KEY using index "ghg_industry_segments_pkey";

alter table "public"."ghg_intensity_metrics" add constraint "ghg_intensity_metrics_pkey" PRIMARY KEY using index "ghg_intensity_metrics_pkey";

alter table "public"."ghg_internal_audits" add constraint "ghg_internal_audits_pkey" PRIMARY KEY using index "ghg_internal_audits_pkey";

alter table "public"."ghg_management_reviews" add constraint "ghg_management_reviews_pkey" PRIMARY KEY using index "ghg_management_reviews_pkey";

alter table "public"."ghg_ml_features" add constraint "ghg_ml_features_pkey" PRIMARY KEY using index "ghg_ml_features_pkey";

alter table "public"."ghg_monthly_readings" add constraint "ghg_monthly_readings_pkey" PRIMARY KEY using index "ghg_monthly_readings_pkey";

alter table "public"."ghg_notifications" add constraint "ghg_notifications_pkey" PRIMARY KEY using index "ghg_notifications_pkey";

alter table "public"."ghg_reading_amendments" add constraint "ghg_reading_amendments_pkey" PRIMARY KEY using index "ghg_reading_amendments_pkey";

alter table "public"."ghg_reporting_boundaries" add constraint "ghg_reporting_boundaries_pkey" PRIMARY KEY using index "ghg_reporting_boundaries_pkey";

alter table "public"."ghg_signoff_chain" add constraint "ghg_signoff_chain_pkey" PRIMARY KEY using index "ghg_signoff_chain_pkey";

alter table "public"."ghg_submissions" add constraint "ghg_submissions_pkey" PRIMARY KEY using index "ghg_submissions_pkey";

alter table "public"."ghg_suppliers" add constraint "ghg_suppliers_pkey" PRIMARY KEY using index "ghg_suppliers_pkey";

alter table "public"."ghg_targets" add constraint "ghg_targets_pkey" PRIMARY KEY using index "ghg_targets_pkey";

alter table "public"."ghg_uncertainty_analysis" add constraint "ghg_uncertainty_analysis_pkey" PRIMARY KEY using index "ghg_uncertainty_analysis_pkey";

alter table "public"."ghg_verification_findings" add constraint "ghg_verification_findings_pkey" PRIMARY KEY using index "ghg_verification_findings_pkey";

alter table "public"."ghg_verification_responses" add constraint "ghg_verification_responses_pkey" PRIMARY KEY using index "ghg_verification_responses_pkey";

alter table "public"."ghg_verifications" add constraint "ghg_verifications_pkey" PRIMARY KEY using index "ghg_verifications_pkey";

alter table "public"."gwp_factors" add constraint "gwp_factors_pkey" PRIMARY KEY using index "gwp_factors_pkey";

alter table "public"."india_grid_zones" add constraint "india_grid_zones_pkey" PRIMARY KEY using index "india_grid_zones_pkey";

alter table "public"."industry_benchmarks" add constraint "industry_benchmarks_pkey" PRIMARY KEY using index "industry_benchmarks_pkey";

alter table "public"."leads" add constraint "leads_pkey" PRIMARY KEY using index "leads_pkey";

alter table "public"."mfa_enforcement_config" add constraint "mfa_enforcement_config_pkey" PRIMARY KEY using index "mfa_enforcement_config_pkey";

alter table "public"."platform_permissions" add constraint "platform_permissions_pkey" PRIMARY KEY using index "platform_permissions_pkey";

alter table "public"."platform_roles" add constraint "platform_roles_pkey" PRIMARY KEY using index "platform_roles_pkey";

alter table "public"."product_emissions" add constraint "product_emissions_pkey" PRIMARY KEY using index "product_emissions_pkey";

alter table "public"."rate_limit_config" add constraint "rate_limit_config_pkey" PRIMARY KEY using index "rate_limit_config_pkey";

alter table "public"."regulatory_filings" add constraint "regulatory_filings_pkey" PRIMARY KEY using index "regulatory_filings_pkey";

alter table "public"."role_permissions" add constraint "role_permissions_pkey" PRIMARY KEY using index "role_permissions_pkey";

alter table "public"."ropa_entries" add constraint "ropa_entries_pkey" PRIMARY KEY using index "ropa_entries_pkey";

alter table "public"."sbti_milestones" add constraint "sbti_milestones_pkey" PRIMARY KEY using index "sbti_milestones_pkey";

alter table "public"."scope3_categories" add constraint "scope3_categories_pkey" PRIMARY KEY using index "scope3_categories_pkey";

alter table "public"."sector_field_templates" add constraint "sector_field_templates_pkey" PRIMARY KEY using index "sector_field_templates_pkey";

alter table "public"."security_incidents" add constraint "security_incidents_pkey" PRIMARY KEY using index "security_incidents_pkey";

alter table "public"."supplier_emissions" add constraint "supplier_emissions_pkey" PRIMARY KEY using index "supplier_emissions_pkey";

alter table "public"."user_organization_roles" add constraint "user_organization_roles_pkey" PRIMARY KEY using index "user_organization_roles_pkey";

alter table "public"."user_sessions" add constraint "user_sessions_pkey" PRIMARY KEY using index "user_sessions_pkey";

alter table "public"."vendor_security_assessments" add constraint "vendor_security_assessments_pkey" PRIMARY KEY using index "vendor_security_assessments_pkey";

alter table "public"."verifiers" add constraint "verifiers_pkey" PRIMARY KEY using index "verifiers_pkey";

alter table "public"."webhook_delivery_log" add constraint "webhook_delivery_log_pkey" PRIMARY KEY using index "webhook_delivery_log_pkey";

alter table "public"."webhook_subscriptions" add constraint "webhook_subscriptions_pkey" PRIMARY KEY using index "webhook_subscriptions_pkey";

alter table "public"."emission_factor_sources" add constraint "emission_factor_sources_pkey" PRIMARY KEY using index "emission_factor_sources_pkey";

alter table "public"."activity_data" add constraint "activity_ai_fk" FOREIGN KEY (ai_validation_id) REFERENCES public.ai_validation(id) not valid;

alter table "public"."activity_data" validate constraint "activity_ai_fk";

alter table "public"."activity_data" add constraint "activity_data_asset_id_fkey" FOREIGN KEY (asset_id) REFERENCES public.client_assets(id) not valid;

alter table "public"."activity_data" validate constraint "activity_data_asset_id_fkey";

alter table "public"."activity_data" add constraint "activity_data_doc_fk" FOREIGN KEY (document_id) REFERENCES public.ghg_documents(id) not valid;

alter table "public"."activity_data" validate constraint "activity_data_doc_fk";

alter table "public"."activity_data" add constraint "activity_data_facility_id_fkey" FOREIGN KEY (facility_id) REFERENCES public.client_sites(id) not valid;

alter table "public"."activity_data" validate constraint "activity_data_facility_id_fkey";

alter table "public"."activity_data" add constraint "chk_activity_data_source" CHECK ((data_source = ANY (ARRAY['manual_entry'::text, 'erp_sync'::text, 'iot_sensor'::text, 'document_extraction'::text, 'api_import'::text]))) not valid;

alter table "public"."activity_data" validate constraint "chk_activity_data_source";

alter table "public"."activity_data" add constraint "chk_activity_period_consistency" CHECK (((month IS NULL) OR (year IS NULL) OR (reporting_period IS NULL) OR (((EXTRACT(month FROM reporting_period))::integer = month) AND ((EXTRACT(year FROM reporting_period))::integer = year)))) not valid;

alter table "public"."activity_data" validate constraint "chk_activity_period_consistency";

alter table "public"."activity_data" add constraint "chk_activity_risk_level" CHECK ((risk_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text, 'unscored'::text]))) not valid;

alter table "public"."activity_data" validate constraint "chk_activity_risk_level";

alter table "public"."activity_data" add constraint "chk_activity_status" CHECK ((status = ANY (ARRAY['pending'::text, 'validated'::text, 'flagged'::text, 'rejected'::text, 'accepted'::text]))) not valid;

alter table "public"."activity_data" validate constraint "chk_activity_status";

alter table "public"."ai_models" add constraint "ai_models_model_name_version_key" UNIQUE using index "ai_models_model_name_version_key";

alter table "public"."ai_validation" add constraint "ai_validation_model_id_fkey" FOREIGN KEY (model_id) REFERENCES public.ai_models(id) not valid;

alter table "public"."ai_validation" validate constraint "ai_validation_model_id_fkey";

alter table "public"."ai_validation" add constraint "ai_validation_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."ai_validation" validate constraint "ai_validation_organization_id_fkey";

alter table "public"."ai_validation" add constraint "chk_ai_human_decision" CHECK (((human_decision = ANY (ARRAY['confirmed_valid'::text, 'confirmed_anomaly'::text, 'overridden'::text])) OR (human_decision IS NULL))) not valid;

alter table "public"."ai_validation" validate constraint "chk_ai_human_decision";

alter table "public"."ai_validation" add constraint "chk_ai_val_status" CHECK ((validation_status = ANY (ARRAY['passed'::text, 'flagged'::text, 'rejected'::text, 'needs_review'::text, 'pending'::text]))) not valid;

alter table "public"."ai_validation" validate constraint "chk_ai_val_status";

alter table "public"."api_keys" add constraint "api_keys_key_hash_key" UNIQUE using index "api_keys_key_hash_key";

alter table "public"."api_keys" add constraint "api_keys_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) ON DELETE RESTRICT not valid;

alter table "public"."api_keys" validate constraint "api_keys_organization_id_fkey";

alter table "public"."api_keys" add constraint "chk_api_key_name" CHECK (((char_length(key_name) >= 3) AND (char_length(key_name) <= 100))) not valid;

alter table "public"."api_keys" validate constraint "chk_api_key_name";

alter table "public"."carbon_offsets" add constraint "carbon_offsets_document_id_fkey" FOREIGN KEY (document_id) REFERENCES public.ghg_documents(id) not valid;

alter table "public"."carbon_offsets" validate constraint "carbon_offsets_document_id_fkey";

alter table "public"."carbon_offsets" add constraint "carbon_offsets_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."carbon_offsets" validate constraint "carbon_offsets_organization_id_fkey";

alter table "public"."carbon_offsets" add constraint "carbon_offsets_registry_id_fkey" FOREIGN KEY (registry_id) REFERENCES public.carbon_offset_registries(id) not valid;

alter table "public"."carbon_offsets" validate constraint "carbon_offsets_registry_id_fkey";

alter table "public"."carbon_offsets" add constraint "carbon_offsets_scope_offset_check" CHECK ((scope_offset = ANY (ARRAY[1, 2, 3]))) not valid;

alter table "public"."carbon_offsets" validate constraint "carbon_offsets_scope_offset_check";

alter table "public"."carbon_offsets" add constraint "chk_offset_project_type" CHECK ((project_type = ANY (ARRAY['renewable_energy'::text, 'forestry'::text, 'cookstoves'::text, 'methane_capture'::text, 'energy_efficiency'::text, 'blue_carbon'::text, 'dac'::text, 'other'::text]))) not valid;

alter table "public"."carbon_offsets" validate constraint "chk_offset_project_type";

alter table "public"."carbon_offsets" add constraint "chk_offset_retirement_purpose" CHECK (((retirement_purpose = ANY (ARRAY['net_zero_claim'::text, 'carbon_neutral_claim'::text, 'regulatory_compliance'::text, 'voluntary_offset'::text])) OR (retirement_purpose IS NULL))) not valid;

alter table "public"."carbon_offsets" validate constraint "chk_offset_retirement_purpose";

alter table "public"."client_assets" add constraint "client_assets_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."client_assets" validate constraint "client_assets_organization_id_fkey";

alter table "public"."client_assets" add constraint "client_assets_site_id_fkey" FOREIGN KEY (site_id) REFERENCES public.client_sites(id) ON DELETE CASCADE not valid;

alter table "public"."client_assets" validate constraint "client_assets_site_id_fkey";

alter table "public"."client_legal_entities" add constraint "client_legal_entities_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) ON DELETE CASCADE not valid;

alter table "public"."client_legal_entities" validate constraint "client_legal_entities_organization_id_fkey";

alter table "public"."client_organizations" add constraint "chk_org_erp_system_type" CHECK (((erp_system_type = ANY (ARRAY['SAP_S4HANA'::text, 'SAP_B1'::text, 'Tally_Prime'::text, 'Oracle'::text, 'Zoho'::text, 'Microsoft_BC'::text, 'custom'::text])) OR (erp_system_type IS NULL))) not valid;

alter table "public"."client_organizations" validate constraint "chk_org_erp_system_type";

alter table "public"."client_organizations" add constraint "client_organizations_assigned_consultant_id_fkey" FOREIGN KEY (assigned_consultant_id) REFERENCES public.consultants(id) not valid;

alter table "public"."client_organizations" validate constraint "client_organizations_assigned_consultant_id_fkey";

alter table "public"."client_organizations" add constraint "client_organizations_cin_key" UNIQUE using index "client_organizations_cin_key";

alter table "public"."client_organizations" add constraint "client_organizations_industry_segment_id_fkey" FOREIGN KEY (industry_segment_id) REFERENCES public.ghg_industry_segments(id) not valid;

alter table "public"."client_organizations" validate constraint "client_organizations_industry_segment_id_fkey";

alter table "public"."client_sites" add constraint "client_sites_grid_zone_fkey" FOREIGN KEY (grid_zone) REFERENCES public.india_grid_zones(id) not valid;

alter table "public"."client_sites" validate constraint "client_sites_grid_zone_fkey";

alter table "public"."client_sites" add constraint "client_sites_legal_entity_id_fkey" FOREIGN KEY (legal_entity_id) REFERENCES public.client_legal_entities(id) not valid;

alter table "public"."client_sites" validate constraint "client_sites_legal_entity_id_fkey";

alter table "public"."client_sites" add constraint "client_sites_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) ON DELETE CASCADE not valid;

alter table "public"."client_sites" validate constraint "client_sites_organization_id_fkey";

alter table "public"."consent_records" add constraint "chk_consent_type" CHECK ((consent_type = ANY (ARRAY['privacy_policy'::text, 'terms_of_service'::text, 'data_processing'::text, 'marketing_communications'::text, 'analytics_tracking'::text, 'cookie_consent'::text, 'third_party_sharing'::text, 'ai_processing'::text]))) not valid;

alter table "public"."consent_records" validate constraint "chk_consent_type";

alter table "public"."consent_records" add constraint "chk_lawful_basis" CHECK ((lawful_basis = ANY (ARRAY['consent'::text, 'legitimate_interest'::text, 'contract'::text, 'legal_obligation'::text, 'vital_interest'::text, 'public_task'::text]))) not valid;

alter table "public"."consent_records" validate constraint "chk_lawful_basis";

alter table "public"."consent_records" add constraint "chk_withdrawal_consistency" CHECK ((((is_withdrawn = false) AND (withdrawn_at IS NULL)) OR ((is_withdrawn = true) AND (withdrawn_at IS NOT NULL)))) not valid;

alter table "public"."consent_records" validate constraint "chk_withdrawal_consistency";

alter table "public"."consent_records" add constraint "consent_records_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."consent_records" validate constraint "consent_records_user_id_fkey";

alter table "public"."consultants" add constraint "consultants_email_key" UNIQUE using index "consultants_email_key";

alter table "public"."consultants" add constraint "consultants_user_id_key" UNIQUE using index "consultants_user_id_key";

alter table "public"."consumer_data_requests" add constraint "chk_ccpa_request_type" CHECK ((request_type = ANY (ARRAY['know_categories'::text, 'know_specific'::text, 'delete'::text, 'opt_out_sale'::text, 'non_discrimination'::text, 'correct'::text, 'portability'::text]))) not valid;

alter table "public"."consumer_data_requests" validate constraint "chk_ccpa_request_type";

alter table "public"."consumer_data_requests" add constraint "chk_ccpa_status" CHECK ((status = ANY (ARRAY['received'::text, 'identity_verification_pending'::text, 'in_progress'::text, 'fulfilled'::text, 'rejected'::text, 'extended'::text, 'withdrawn'::text]))) not valid;

alter table "public"."consumer_data_requests" validate constraint "chk_ccpa_status";

alter table "public"."consumer_data_requests" add constraint "consumer_data_requests_handled_by_fkey" FOREIGN KEY (handled_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."consumer_data_requests" validate constraint "consumer_data_requests_handled_by_fkey";

alter table "public"."data_portability_exports" add constraint "chk_export_format" CHECK ((export_format = ANY (ARRAY['json'::text, 'csv'::text, 'json_csv_zip'::text]))) not valid;

alter table "public"."data_portability_exports" validate constraint "chk_export_format";

alter table "public"."data_portability_exports" add constraint "chk_export_status" CHECK ((status = ANY (ARRAY['requested'::text, 'processing'::text, 'ready'::text, 'downloaded'::text, 'expired'::text, 'failed'::text]))) not valid;

alter table "public"."data_portability_exports" validate constraint "chk_export_status";

alter table "public"."data_portability_exports" add constraint "data_portability_exports_requested_by_fkey" FOREIGN KEY (requested_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."data_portability_exports" validate constraint "data_portability_exports_requested_by_fkey";

alter table "public"."data_portability_exports" add constraint "data_portability_exports_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."data_portability_exports" validate constraint "data_portability_exports_user_id_fkey";

alter table "public"."data_quality_audit" add constraint "chk_dqa_status" CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'auto_applied'::text]))) not valid;

alter table "public"."data_quality_audit" validate constraint "chk_dqa_status";

alter table "public"."data_quality_audit" add constraint "data_quality_audit_model_id_fkey" FOREIGN KEY (model_id) REFERENCES public.ai_models(id) not valid;

alter table "public"."data_quality_audit" validate constraint "data_quality_audit_model_id_fkey";

alter table "public"."data_quality_audit" add constraint "data_quality_audit_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."data_quality_audit" validate constraint "data_quality_audit_organization_id_fkey";

alter table "public"."data_retention_policies" add constraint "data_retention_policies_entity_type_key" UNIQUE using index "data_retention_policies_entity_type_key";

alter table "public"."data_sale_opt_outs" add constraint "chk_opt_out_method" CHECK ((opt_out_method = ANY (ARRAY['web_form'::text, 'email'::text, 'phone'::text, 'api'::text, 'in_person'::text]))) not valid;

alter table "public"."data_sale_opt_outs" validate constraint "chk_opt_out_method";

alter table "public"."data_sale_opt_outs" add constraint "data_sale_opt_outs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."data_sale_opt_outs" validate constraint "data_sale_opt_outs_user_id_fkey";

alter table "public"."data_subject_access_requests" add constraint "chk_dsar_status" CHECK ((status = ANY (ARRAY['received'::text, 'identity_verification_pending'::text, 'in_progress'::text, 'fulfilled'::text, 'rejected'::text, 'extended'::text, 'legal_hold'::text, 'withdrawn'::text]))) not valid;

alter table "public"."data_subject_access_requests" validate constraint "chk_dsar_status";

alter table "public"."data_subject_access_requests" add constraint "chk_dsar_type" CHECK ((request_type = ANY (ARRAY['access'::text, 'deletion'::text, 'portability'::text, 'correction'::text, 'processing_restriction'::text, 'objection'::text, 'opt_out'::text]))) not valid;

alter table "public"."data_subject_access_requests" validate constraint "chk_dsar_type";

alter table "public"."data_subject_access_requests" add constraint "data_subject_access_requests_handled_by_fkey" FOREIGN KEY (handled_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."data_subject_access_requests" validate constraint "data_subject_access_requests_handled_by_fkey";

alter table "public"."data_subject_access_requests" add constraint "data_subject_access_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."data_subject_access_requests" validate constraint "data_subject_access_requests_user_id_fkey";

alter table "public"."dpdp_erasure_requests" add constraint "chk_erasure_request_type" CHECK ((request_type = ANY (ARRAY['full_erasure'::text, 'anonymise'::text, 'data_export'::text, 'processing_restriction'::text]))) not valid;

alter table "public"."dpdp_erasure_requests" validate constraint "chk_erasure_request_type";

alter table "public"."dpdp_erasure_requests" add constraint "dpdp_erasure_requests_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."dpdp_erasure_requests" validate constraint "dpdp_erasure_requests_organization_id_fkey";

alter table "public"."emission_factor_versions" add constraint "emission_factor_versions_approved_by_fkey" FOREIGN KEY (approved_by) REFERENCES public.consultants(id) not valid;

alter table "public"."emission_factor_versions" validate constraint "emission_factor_versions_approved_by_fkey";

alter table "public"."emission_factor_versions" add constraint "emission_factor_versions_new_factor_id_fkey" FOREIGN KEY (new_factor_id) REFERENCES public.emission_factors(id) not valid;

alter table "public"."emission_factor_versions" validate constraint "emission_factor_versions_new_factor_id_fkey";

alter table "public"."emission_factor_versions" add constraint "emission_factor_versions_old_factor_id_fkey" FOREIGN KEY (old_factor_id) REFERENCES public.emission_factors(id) not valid;

alter table "public"."emission_factor_versions" validate constraint "emission_factor_versions_old_factor_id_fkey";

alter table "public"."emission_factors" add constraint "emission_factors_factor_code_factor_version_key" UNIQUE using index "emission_factors_factor_code_factor_version_key";

alter table "public"."emission_factors" add constraint "emission_factors_grid_zone_fkey" FOREIGN KEY (grid_zone) REFERENCES public.india_grid_zones(id) not valid;

alter table "public"."emission_factors" validate constraint "emission_factors_grid_zone_fkey";

alter table "public"."emission_factors" add constraint "emission_factors_methodology_id_fkey" FOREIGN KEY (methodology_id) REFERENCES public.ghg_calculation_methodologies(id) not valid;

alter table "public"."emission_factors" validate constraint "emission_factors_methodology_id_fkey";

alter table "public"."emission_factors" add constraint "emission_factors_source_code_fkey" FOREIGN KEY (source_code) REFERENCES public.emission_factor_sources(source_code) not valid;

alter table "public"."emission_factors" validate constraint "emission_factors_source_code_fkey";

alter table "public"."emission_factors" add constraint "emission_factors_superseded_by_id_fkey" FOREIGN KEY (superseded_by_id) REFERENCES public.emission_factors(id) not valid;

alter table "public"."emission_factors" validate constraint "emission_factors_superseded_by_id_fkey";

alter table "public"."erp_connection_vault" add constraint "chk_vault_secret_type" CHECK ((secret_type = ANY (ARRAY['api_key'::text, 'oauth_client_id'::text, 'oauth_client_secret'::text, 'db_password'::text, 'webhook_secret'::text, 'sftp_password'::text, 'jwt_secret'::text]))) not valid;

alter table "public"."erp_connection_vault" validate constraint "chk_vault_secret_type";

alter table "public"."erp_connection_vault" add constraint "erp_connection_vault_erp_system_id_fkey" FOREIGN KEY (erp_system_id) REFERENCES public.erp_systems(id) not valid;

alter table "public"."erp_connection_vault" validate constraint "erp_connection_vault_erp_system_id_fkey";

alter table "public"."erp_connection_vault" add constraint "erp_connection_vault_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) ON DELETE RESTRICT not valid;

alter table "public"."erp_connection_vault" validate constraint "erp_connection_vault_organization_id_fkey";

alter table "public"."erp_field_mappings" add constraint "erp_field_mappings_erp_system_id_fkey" FOREIGN KEY (erp_system_id) REFERENCES public.erp_systems(id) not valid;

alter table "public"."erp_field_mappings" validate constraint "erp_field_mappings_erp_system_id_fkey";

alter table "public"."erp_field_mappings" add constraint "erp_field_mappings_ghg_site_id_fkey" FOREIGN KEY (ghg_site_id) REFERENCES public.client_sites(id) not valid;

alter table "public"."erp_field_mappings" validate constraint "erp_field_mappings_ghg_site_id_fkey";

alter table "public"."erp_field_mappings" add constraint "erp_field_mappings_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."erp_field_mappings" validate constraint "erp_field_mappings_organization_id_fkey";

alter table "public"."erp_sync_logs" add constraint "chk_erp_data_class" CHECK ((data_classification = ANY (ARRAY['public'::text, 'internal'::text, 'confidential'::text, 'restricted'::text]))) not valid;

alter table "public"."erp_sync_logs" validate constraint "chk_erp_data_class";

alter table "public"."erp_sync_logs" add constraint "erp_sync_logs_erp_system_id_fkey" FOREIGN KEY (erp_system_id) REFERENCES public.erp_systems(id) not valid;

alter table "public"."erp_sync_logs" validate constraint "erp_sync_logs_erp_system_id_fkey";

alter table "public"."erp_sync_logs" add constraint "erp_sync_logs_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."erp_sync_logs" validate constraint "erp_sync_logs_organization_id_fkey";

alter table "public"."erp_systems" add constraint "erp_systems_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."erp_systems" validate constraint "erp_systems_organization_id_fkey";

alter table "public"."erp_systems" add constraint "erp_systems_organization_id_key" UNIQUE using index "erp_systems_organization_id_key";

alter table "public"."feature_flags" add constraint "feature_flags_flag_key_key" UNIQUE using index "feature_flags_flag_key_key";

alter table "public"."feature_flags" add constraint "feature_flags_rollout_pct_check" CHECK (((rollout_pct >= 0) AND (rollout_pct <= 100))) not valid;

alter table "public"."feature_flags" validate constraint "feature_flags_rollout_pct_check";

alter table "public"."fleet_monthly_logs" add constraint "fleet_monthly_logs_emission_factor_id_fkey" FOREIGN KEY (emission_factor_id) REFERENCES public.emission_factors(id) not valid;

alter table "public"."fleet_monthly_logs" validate constraint "fleet_monthly_logs_emission_factor_id_fkey";

alter table "public"."fleet_monthly_logs" add constraint "fleet_monthly_logs_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."fleet_monthly_logs" validate constraint "fleet_monthly_logs_organization_id_fkey";

alter table "public"."fleet_monthly_logs" add constraint "fleet_monthly_logs_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES public.consultants(id) not valid;

alter table "public"."fleet_monthly_logs" validate constraint "fleet_monthly_logs_reviewed_by_fkey";

alter table "public"."fleet_monthly_logs" add constraint "fleet_monthly_logs_site_id_fkey" FOREIGN KEY (site_id) REFERENCES public.client_sites(id) not valid;

alter table "public"."fleet_monthly_logs" validate constraint "fleet_monthly_logs_site_id_fkey";

alter table "public"."fleet_monthly_logs" add constraint "fleet_monthly_logs_vehicle_id_fkey" FOREIGN KEY (vehicle_id) REFERENCES public.fleet_vehicles(id) not valid;

alter table "public"."fleet_monthly_logs" validate constraint "fleet_monthly_logs_vehicle_id_fkey";

alter table "public"."fleet_monthly_logs" add constraint "fleet_monthly_logs_vehicle_id_month_year_key" UNIQUE using index "fleet_monthly_logs_vehicle_id_month_year_key";

alter table "public"."fleet_vehicles" add constraint "fleet_vehicles_legal_entity_id_fkey" FOREIGN KEY (legal_entity_id) REFERENCES public.client_legal_entities(id) not valid;

alter table "public"."fleet_vehicles" validate constraint "fleet_vehicles_legal_entity_id_fkey";

alter table "public"."fleet_vehicles" add constraint "fleet_vehicles_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."fleet_vehicles" validate constraint "fleet_vehicles_organization_id_fkey";

alter table "public"."fleet_vehicles" add constraint "fleet_vehicles_organization_id_registration_number_key" UNIQUE using index "fleet_vehicles_organization_id_registration_number_key";

alter table "public"."fleet_vehicles" add constraint "fleet_vehicles_site_id_fkey" FOREIGN KEY (site_id) REFERENCES public.client_sites(id) not valid;

alter table "public"."fleet_vehicles" validate constraint "fleet_vehicles_site_id_fkey";

alter table "public"."framework_disclosures" add constraint "framework_disclosures_framework_id_fkey" FOREIGN KEY (framework_id) REFERENCES public.disclosure_frameworks(id) not valid;

alter table "public"."framework_disclosures" validate constraint "framework_disclosures_framework_id_fkey";

alter table "public"."framework_disclosures" add constraint "framework_disclosures_indicator_id_fkey" FOREIGN KEY (indicator_id) REFERENCES public.framework_indicators(id) not valid;

alter table "public"."framework_disclosures" validate constraint "framework_disclosures_indicator_id_fkey";

alter table "public"."framework_disclosures" add constraint "framework_disclosures_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."framework_disclosures" validate constraint "framework_disclosures_organization_id_fkey";

alter table "public"."framework_disclosures" add constraint "framework_disclosures_organization_id_framework_id_indicato_key" UNIQUE using index "framework_disclosures_organization_id_framework_id_indicato_key";

alter table "public"."framework_indicators" add constraint "framework_indicators_framework_id_fkey" FOREIGN KEY (framework_id) REFERENCES public.disclosure_frameworks(id) not valid;

alter table "public"."framework_indicators" validate constraint "framework_indicators_framework_id_fkey";

alter table "public"."framework_indicators" add constraint "framework_indicators_framework_id_indicator_code_key" UNIQUE using index "framework_indicators_framework_id_indicator_code_key";

alter table "public"."ghg_anomaly_flags" add constraint "ghg_anomaly_flags_activity_data_id_fkey" FOREIGN KEY (activity_data_id) REFERENCES public.activity_data(id) not valid;

alter table "public"."ghg_anomaly_flags" validate constraint "ghg_anomaly_flags_activity_data_id_fkey";

alter table "public"."ghg_anomaly_flags" add constraint "ghg_anomaly_flags_fleet_log_id_fkey" FOREIGN KEY (fleet_log_id) REFERENCES public.fleet_monthly_logs(id) not valid;

alter table "public"."ghg_anomaly_flags" validate constraint "ghg_anomaly_flags_fleet_log_id_fkey";

alter table "public"."ghg_anomaly_flags" add constraint "ghg_anomaly_flags_model_id_fkey" FOREIGN KEY (model_id) REFERENCES public.ai_models(id) not valid;

alter table "public"."ghg_anomaly_flags" validate constraint "ghg_anomaly_flags_model_id_fkey";

alter table "public"."ghg_anomaly_flags" add constraint "ghg_anomaly_flags_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."ghg_anomaly_flags" validate constraint "ghg_anomaly_flags_organization_id_fkey";

alter table "public"."ghg_anomaly_flags" add constraint "ghg_anomaly_flags_reading_id_fkey" FOREIGN KEY (reading_id) REFERENCES public.ghg_monthly_readings(id) not valid;

alter table "public"."ghg_anomaly_flags" validate constraint "ghg_anomaly_flags_reading_id_fkey";

alter table "public"."ghg_base_year_recalculations" add constraint "ghg_base_year_recalculations_approved_by_fkey" FOREIGN KEY (approved_by) REFERENCES public.consultants(id) not valid;

alter table "public"."ghg_base_year_recalculations" validate constraint "ghg_base_year_recalculations_approved_by_fkey";

alter table "public"."ghg_base_year_recalculations" add constraint "ghg_base_year_recalculations_base_year_id_fkey" FOREIGN KEY (base_year_id) REFERENCES public.ghg_base_years(id) not valid;

alter table "public"."ghg_base_year_recalculations" validate constraint "ghg_base_year_recalculations_base_year_id_fkey";

alter table "public"."ghg_base_years" add constraint "ghg_base_years_locked_by_fkey" FOREIGN KEY (locked_by) REFERENCES public.consultants(id) not valid;

alter table "public"."ghg_base_years" validate constraint "ghg_base_years_locked_by_fkey";

alter table "public"."ghg_base_years" add constraint "ghg_base_years_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."ghg_base_years" validate constraint "ghg_base_years_organization_id_fkey";

alter table "public"."ghg_base_years" add constraint "ghg_base_years_organization_id_key" UNIQUE using index "ghg_base_years_organization_id_key";

alter table "public"."ghg_corrective_actions" add constraint "ghg_corrective_actions_finding_id_fkey" FOREIGN KEY (finding_id) REFERENCES public.ghg_verification_findings(id) not valid;

alter table "public"."ghg_corrective_actions" validate constraint "ghg_corrective_actions_finding_id_fkey";

alter table "public"."ghg_corrective_actions" add constraint "ghg_corrective_actions_internal_audit_id_fkey" FOREIGN KEY (internal_audit_id) REFERENCES public.ghg_internal_audits(id) not valid;

alter table "public"."ghg_corrective_actions" validate constraint "ghg_corrective_actions_internal_audit_id_fkey";

alter table "public"."ghg_corrective_actions" add constraint "ghg_corrective_actions_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."ghg_corrective_actions" validate constraint "ghg_corrective_actions_organization_id_fkey";

alter table "public"."ghg_data_quality_assessments" add constraint "ghg_data_quality_assessments_accuracy_score_check" CHECK (((accuracy_score >= 1) AND (accuracy_score <= 5))) not valid;

alter table "public"."ghg_data_quality_assessments" validate constraint "ghg_data_quality_assessments_accuracy_score_check";

alter table "public"."ghg_data_quality_assessments" add constraint "ghg_data_quality_assessments_assessed_by_fkey" FOREIGN KEY (assessed_by) REFERENCES public.consultants(id) not valid;

alter table "public"."ghg_data_quality_assessments" validate constraint "ghg_data_quality_assessments_assessed_by_fkey";

alter table "public"."ghg_data_quality_assessments" add constraint "ghg_data_quality_assessments_completeness_score_check" CHECK (((completeness_score >= 1) AND (completeness_score <= 5))) not valid;

alter table "public"."ghg_data_quality_assessments" validate constraint "ghg_data_quality_assessments_completeness_score_check";

alter table "public"."ghg_data_quality_assessments" add constraint "ghg_data_quality_assessments_consistency_score_check" CHECK (((consistency_score >= 1) AND (consistency_score <= 5))) not valid;

alter table "public"."ghg_data_quality_assessments" validate constraint "ghg_data_quality_assessments_consistency_score_check";

alter table "public"."ghg_data_quality_assessments" add constraint "ghg_data_quality_assessments_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."ghg_data_quality_assessments" validate constraint "ghg_data_quality_assessments_organization_id_fkey";

alter table "public"."ghg_data_quality_assessments" add constraint "ghg_data_quality_assessments_reading_id_fkey" FOREIGN KEY (reading_id) REFERENCES public.ghg_monthly_readings(id) not valid;

alter table "public"."ghg_data_quality_assessments" validate constraint "ghg_data_quality_assessments_reading_id_fkey";

alter table "public"."ghg_data_quality_assessments" add constraint "ghg_data_quality_assessments_relevance_score_check" CHECK (((relevance_score >= 1) AND (relevance_score <= 5))) not valid;

alter table "public"."ghg_data_quality_assessments" validate constraint "ghg_data_quality_assessments_relevance_score_check";

alter table "public"."ghg_data_quality_assessments" add constraint "ghg_data_quality_assessments_transparency_score_check" CHECK (((transparency_score >= 1) AND (transparency_score <= 5))) not valid;

alter table "public"."ghg_data_quality_assessments" validate constraint "ghg_data_quality_assessments_transparency_score_check";

alter table "public"."ghg_documents" add constraint "chk_doc_extraction_status" CHECK ((extraction_status = ANY (ARRAY['pending'::text, 'queued'::text, 'processing'::text, 'extracted'::text, 'failed'::text, 'manual_review'::text]))) not valid;

alter table "public"."ghg_documents" validate constraint "chk_doc_extraction_status";

alter table "public"."ghg_documents" add constraint "doc_ai_model_fk" FOREIGN KEY (extraction_model_id) REFERENCES public.ai_models(id) not valid;

alter table "public"."ghg_documents" validate constraint "doc_ai_model_fk";

alter table "public"."ghg_documents" add constraint "ghg_documents_amendment_id_fkey" FOREIGN KEY (amendment_id) REFERENCES public.ghg_reading_amendments(id) not valid;

alter table "public"."ghg_documents" validate constraint "ghg_documents_amendment_id_fkey";

alter table "public"."ghg_documents" add constraint "ghg_documents_asset_id_fkey" FOREIGN KEY (asset_id) REFERENCES public.client_assets(id) not valid;

alter table "public"."ghg_documents" validate constraint "ghg_documents_asset_id_fkey";

alter table "public"."ghg_documents" add constraint "ghg_documents_hazmat_id_fkey" FOREIGN KEY (hazmat_id) REFERENCES public.ghg_hazardous_consumables(id) not valid;

alter table "public"."ghg_documents" validate constraint "ghg_documents_hazmat_id_fkey";

alter table "public"."ghg_documents" add constraint "ghg_documents_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."ghg_documents" validate constraint "ghg_documents_organization_id_fkey";

alter table "public"."ghg_documents" add constraint "ghg_documents_reading_id_fkey" FOREIGN KEY (reading_id) REFERENCES public.ghg_monthly_readings(id) not valid;

alter table "public"."ghg_documents" validate constraint "ghg_documents_reading_id_fkey";

alter table "public"."ghg_documents" add constraint "ghg_documents_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES public.consultants(id) not valid;

alter table "public"."ghg_documents" validate constraint "ghg_documents_reviewed_by_fkey";

alter table "public"."ghg_documents" add constraint "ghg_documents_site_id_fkey" FOREIGN KEY (site_id) REFERENCES public.client_sites(id) not valid;

alter table "public"."ghg_documents" validate constraint "ghg_documents_site_id_fkey";

alter table "public"."ghg_documents" add constraint "ghg_documents_submission_id_fkey" FOREIGN KEY (submission_id) REFERENCES public.ghg_submissions(id) not valid;

alter table "public"."ghg_documents" validate constraint "ghg_documents_submission_id_fkey";

alter table "public"."ghg_documents" add constraint "ghg_documents_vehicle_id_fkey" FOREIGN KEY (vehicle_id) REFERENCES public.fleet_vehicles(id) not valid;

alter table "public"."ghg_documents" validate constraint "ghg_documents_vehicle_id_fkey";

alter table "public"."ghg_emission_source_register" add constraint "ghg_emission_source_register_asset_id_fkey" FOREIGN KEY (asset_id) REFERENCES public.client_assets(id) not valid;

alter table "public"."ghg_emission_source_register" validate constraint "ghg_emission_source_register_asset_id_fkey";

alter table "public"."ghg_emission_source_register" add constraint "ghg_emission_source_register_emission_factor_id_fkey" FOREIGN KEY (emission_factor_id) REFERENCES public.emission_factors(id) not valid;

alter table "public"."ghg_emission_source_register" validate constraint "ghg_emission_source_register_emission_factor_id_fkey";

alter table "public"."ghg_emission_source_register" add constraint "ghg_emission_source_register_methodology_id_fkey" FOREIGN KEY (methodology_id) REFERENCES public.ghg_calculation_methodologies(id) not valid;

alter table "public"."ghg_emission_source_register" validate constraint "ghg_emission_source_register_methodology_id_fkey";

alter table "public"."ghg_emission_source_register" add constraint "ghg_emission_source_register_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."ghg_emission_source_register" validate constraint "ghg_emission_source_register_organization_id_fkey";

alter table "public"."ghg_emission_source_register" add constraint "ghg_emission_source_register_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES public.consultants(id) not valid;

alter table "public"."ghg_emission_source_register" validate constraint "ghg_emission_source_register_reviewed_by_fkey";

alter table "public"."ghg_emission_source_register" add constraint "ghg_emission_source_register_scope3_category_fkey" FOREIGN KEY (scope3_category) REFERENCES public.scope3_categories(id) not valid;

alter table "public"."ghg_emission_source_register" validate constraint "ghg_emission_source_register_scope3_category_fkey";

alter table "public"."ghg_emission_source_register" add constraint "ghg_emission_source_register_scope_check" CHECK ((scope = ANY (ARRAY[1, 2, 3]))) not valid;

alter table "public"."ghg_emission_source_register" validate constraint "ghg_emission_source_register_scope_check";

alter table "public"."ghg_emission_source_register" add constraint "ghg_emission_source_register_site_id_fkey" FOREIGN KEY (site_id) REFERENCES public.client_sites(id) not valid;

alter table "public"."ghg_emission_source_register" validate constraint "ghg_emission_source_register_site_id_fkey";

alter table "public"."ghg_exclusion_register" add constraint "ghg_exclusion_register_approved_by_fkey" FOREIGN KEY (approved_by) REFERENCES public.consultants(id) not valid;

alter table "public"."ghg_exclusion_register" validate constraint "ghg_exclusion_register_approved_by_fkey";

alter table "public"."ghg_exclusion_register" add constraint "ghg_exclusion_register_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."ghg_exclusion_register" validate constraint "ghg_exclusion_register_organization_id_fkey";

alter table "public"."ghg_hazardous_consumables" add constraint "ghg_hazardous_consumables_asset_id_fkey" FOREIGN KEY (asset_id) REFERENCES public.client_assets(id) not valid;

alter table "public"."ghg_hazardous_consumables" validate constraint "ghg_hazardous_consumables_asset_id_fkey";

alter table "public"."ghg_hazardous_consumables" add constraint "ghg_hazardous_consumables_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."ghg_hazardous_consumables" validate constraint "ghg_hazardous_consumables_organization_id_fkey";

alter table "public"."ghg_hazardous_consumables" add constraint "ghg_hazardous_consumables_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES public.consultants(id) not valid;

alter table "public"."ghg_hazardous_consumables" validate constraint "ghg_hazardous_consumables_reviewed_by_fkey";

alter table "public"."ghg_hazardous_consumables" add constraint "ghg_hazardous_consumables_site_id_fkey" FOREIGN KEY (site_id) REFERENCES public.client_sites(id) not valid;

alter table "public"."ghg_hazardous_consumables" validate constraint "ghg_hazardous_consumables_site_id_fkey";

alter table "public"."ghg_hazardous_consumables" add constraint "ghg_hazardous_consumables_source_register_id_fkey" FOREIGN KEY (source_register_id) REFERENCES public.ghg_emission_source_register(id) not valid;

alter table "public"."ghg_hazardous_consumables" validate constraint "ghg_hazardous_consumables_source_register_id_fkey";

alter table "public"."ghg_hazardous_consumables" add constraint "ghg_hazardous_consumables_submission_id_fkey" FOREIGN KEY (submission_id) REFERENCES public.ghg_submissions(id) not valid;

alter table "public"."ghg_hazardous_consumables" validate constraint "ghg_hazardous_consumables_submission_id_fkey";

alter table "public"."ghg_hazardous_consumables" add constraint "hazwaste_manifest_required" CHECK (((is_hazwaste_india = false) OR (disposal_manifest_no IS NOT NULL))) not valid;

alter table "public"."ghg_hazardous_consumables" validate constraint "hazwaste_manifest_required";

alter table "public"."ghg_industry_segments" add constraint "ghg_industry_segments_cbam_sector_id_fkey" FOREIGN KEY (cbam_sector_id) REFERENCES public.sectors(id) not valid;

alter table "public"."ghg_industry_segments" validate constraint "ghg_industry_segments_cbam_sector_id_fkey";

alter table "public"."ghg_intensity_metrics" add constraint "ghg_intensity_metrics_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."ghg_intensity_metrics" validate constraint "ghg_intensity_metrics_organization_id_fkey";

alter table "public"."ghg_internal_audits" add constraint "ghg_internal_audits_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."ghg_internal_audits" validate constraint "ghg_internal_audits_organization_id_fkey";

alter table "public"."ghg_management_reviews" add constraint "ghg_management_reviews_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."ghg_management_reviews" validate constraint "ghg_management_reviews_organization_id_fkey";

alter table "public"."ghg_ml_features" add constraint "ghg_ml_features_model_id_fkey" FOREIGN KEY (model_id) REFERENCES public.ai_models(id) not valid;

alter table "public"."ghg_ml_features" validate constraint "ghg_ml_features_model_id_fkey";

alter table "public"."ghg_ml_features" add constraint "ghg_ml_features_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."ghg_ml_features" validate constraint "ghg_ml_features_organization_id_fkey";

alter table "public"."ghg_ml_features" add constraint "ghg_ml_features_site_id_fkey" FOREIGN KEY (site_id) REFERENCES public.client_sites(id) not valid;

alter table "public"."ghg_ml_features" validate constraint "ghg_ml_features_site_id_fkey";

alter table "public"."ghg_monthly_readings" add constraint "chk_reading_risk_level" CHECK ((risk_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text, 'unscored'::text]))) not valid;

alter table "public"."ghg_monthly_readings" validate constraint "chk_reading_risk_level";

alter table "public"."ghg_monthly_readings" add constraint "chk_reading_status" CHECK ((status = ANY (ARRAY['draft'::text, 'pending_review'::text, 'reviewed'::text, 'approved'::text, 'locked'::text]))) not valid;

alter table "public"."ghg_monthly_readings" validate constraint "chk_reading_status";

alter table "public"."ghg_monthly_readings" add constraint "ghg_monthly_readings_activity_data_id_fkey" FOREIGN KEY (activity_data_id) REFERENCES public.activity_data(id) not valid;

alter table "public"."ghg_monthly_readings" validate constraint "ghg_monthly_readings_activity_data_id_fkey";

alter table "public"."ghg_monthly_readings" add constraint "ghg_monthly_readings_approved_by_fkey" FOREIGN KEY (approved_by) REFERENCES public.consultants(id) not valid;

alter table "public"."ghg_monthly_readings" validate constraint "ghg_monthly_readings_approved_by_fkey";

alter table "public"."ghg_monthly_readings" add constraint "ghg_monthly_readings_asset_id_fkey" FOREIGN KEY (asset_id) REFERENCES public.client_assets(id) not valid;

alter table "public"."ghg_monthly_readings" validate constraint "ghg_monthly_readings_asset_id_fkey";

alter table "public"."ghg_monthly_readings" add constraint "ghg_monthly_readings_data_quality_score_check" CHECK (((data_quality_score >= 1) AND (data_quality_score <= 5))) not valid;

alter table "public"."ghg_monthly_readings" validate constraint "ghg_monthly_readings_data_quality_score_check";

alter table "public"."ghg_monthly_readings" add constraint "ghg_monthly_readings_emission_factor_id_fkey" FOREIGN KEY (emission_factor_id) REFERENCES public.emission_factors(id) not valid;

alter table "public"."ghg_monthly_readings" validate constraint "ghg_monthly_readings_emission_factor_id_fkey";

alter table "public"."ghg_monthly_readings" add constraint "ghg_monthly_readings_legal_entity_id_fkey" FOREIGN KEY (legal_entity_id) REFERENCES public.client_legal_entities(id) not valid;

alter table "public"."ghg_monthly_readings" validate constraint "ghg_monthly_readings_legal_entity_id_fkey";

alter table "public"."ghg_monthly_readings" add constraint "ghg_monthly_readings_month_check" CHECK (((month >= 1) AND (month <= 12))) not valid;

alter table "public"."ghg_monthly_readings" validate constraint "ghg_monthly_readings_month_check";

alter table "public"."ghg_monthly_readings" add constraint "ghg_monthly_readings_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."ghg_monthly_readings" validate constraint "ghg_monthly_readings_organization_id_fkey";

alter table "public"."ghg_monthly_readings" add constraint "ghg_monthly_readings_organization_id_site_id_field_key_mont_key" UNIQUE using index "ghg_monthly_readings_organization_id_site_id_field_key_mont_key";

alter table "public"."ghg_monthly_readings" add constraint "ghg_monthly_readings_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES public.consultants(id) not valid;

alter table "public"."ghg_monthly_readings" validate constraint "ghg_monthly_readings_reviewed_by_fkey";

alter table "public"."ghg_monthly_readings" add constraint "ghg_monthly_readings_scope3_category_fkey" FOREIGN KEY (scope3_category) REFERENCES public.scope3_categories(id) not valid;

alter table "public"."ghg_monthly_readings" validate constraint "ghg_monthly_readings_scope3_category_fkey";

alter table "public"."ghg_monthly_readings" add constraint "ghg_monthly_readings_scope_check" CHECK ((scope = ANY (ARRAY[1, 2, 3]))) not valid;

alter table "public"."ghg_monthly_readings" validate constraint "ghg_monthly_readings_scope_check";

alter table "public"."ghg_monthly_readings" add constraint "ghg_monthly_readings_site_id_fkey" FOREIGN KEY (site_id) REFERENCES public.client_sites(id) not valid;

alter table "public"."ghg_monthly_readings" validate constraint "ghg_monthly_readings_site_id_fkey";

alter table "public"."ghg_monthly_readings" add constraint "ghg_monthly_readings_source_register_id_fkey" FOREIGN KEY (source_register_id) REFERENCES public.ghg_emission_source_register(id) not valid;

alter table "public"."ghg_monthly_readings" validate constraint "ghg_monthly_readings_source_register_id_fkey";

alter table "public"."ghg_monthly_readings" add constraint "ghg_monthly_readings_submission_id_fkey" FOREIGN KEY (submission_id) REFERENCES public.ghg_submissions(id) not valid;

alter table "public"."ghg_monthly_readings" validate constraint "ghg_monthly_readings_submission_id_fkey";

alter table "public"."ghg_monthly_readings" add constraint "reading_ai_fk" FOREIGN KEY (ai_validation_id) REFERENCES public.ai_validation(id) not valid;

alter table "public"."ghg_monthly_readings" validate constraint "reading_ai_fk";

alter table "public"."ghg_notifications" add constraint "ghg_notifications_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."ghg_notifications" validate constraint "ghg_notifications_organization_id_fkey";

alter table "public"."ghg_reading_amendments" add constraint "amendment_doc_fk" FOREIGN KEY (supporting_doc_id) REFERENCES public.ghg_documents(id) not valid;

alter table "public"."ghg_reading_amendments" validate constraint "amendment_doc_fk";

alter table "public"."ghg_reading_amendments" add constraint "ghg_reading_amendments_amended_by_fkey" FOREIGN KEY (amended_by) REFERENCES public.consultants(id) not valid;

alter table "public"."ghg_reading_amendments" validate constraint "ghg_reading_amendments_amended_by_fkey";

alter table "public"."ghg_reading_amendments" add constraint "ghg_reading_amendments_approved_by_fkey" FOREIGN KEY (approved_by) REFERENCES public.consultants(id) not valid;

alter table "public"."ghg_reading_amendments" validate constraint "ghg_reading_amendments_approved_by_fkey";

alter table "public"."ghg_reading_amendments" add constraint "ghg_reading_amendments_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."ghg_reading_amendments" validate constraint "ghg_reading_amendments_organization_id_fkey";

alter table "public"."ghg_reading_amendments" add constraint "ghg_reading_amendments_original_reading_id_fkey" FOREIGN KEY (original_reading_id) REFERENCES public.ghg_monthly_readings(id) not valid;

alter table "public"."ghg_reading_amendments" validate constraint "ghg_reading_amendments_original_reading_id_fkey";

alter table "public"."ghg_reporting_boundaries" add constraint "ghg_reporting_boundaries_consultant_id_fkey" FOREIGN KEY (consultant_id) REFERENCES public.consultants(id) not valid;

alter table "public"."ghg_reporting_boundaries" validate constraint "ghg_reporting_boundaries_consultant_id_fkey";

alter table "public"."ghg_reporting_boundaries" add constraint "ghg_reporting_boundaries_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."ghg_reporting_boundaries" validate constraint "ghg_reporting_boundaries_organization_id_fkey";

alter table "public"."ghg_reporting_boundaries" add constraint "ghg_reporting_boundaries_organization_id_fy_year_key" UNIQUE using index "ghg_reporting_boundaries_organization_id_fy_year_key";

alter table "public"."ghg_signoff_chain" add constraint "ghg_signoff_chain_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."ghg_signoff_chain" validate constraint "ghg_signoff_chain_organization_id_fkey";

alter table "public"."ghg_signoff_chain" add constraint "ghg_signoff_chain_submission_id_fkey" FOREIGN KEY (submission_id) REFERENCES public.ghg_submissions(id) not valid;

alter table "public"."ghg_signoff_chain" validate constraint "ghg_signoff_chain_submission_id_fkey";

alter table "public"."ghg_submissions" add constraint "chk_submission_status" CHECK ((status = ANY (ARRAY['draft'::text, 'submitted'::text, 'under_verification'::text, 'verified'::text, 'rejected'::text, 'locked'::text]))) not valid;

alter table "public"."ghg_submissions" validate constraint "chk_submission_status";

alter table "public"."ghg_submissions" add constraint "ghg_submissions_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."ghg_submissions" validate constraint "ghg_submissions_organization_id_fkey";

alter table "public"."ghg_submissions" add constraint "ghg_submissions_organization_id_fy_year_key" UNIQUE using index "ghg_submissions_organization_id_fy_year_key";

alter table "public"."ghg_suppliers" add constraint "ghg_suppliers_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."ghg_suppliers" validate constraint "ghg_suppliers_organization_id_fkey";

alter table "public"."ghg_suppliers" add constraint "ghg_suppliers_scope3_category_fkey" FOREIGN KEY (scope3_category) REFERENCES public.scope3_categories(id) not valid;

alter table "public"."ghg_suppliers" validate constraint "ghg_suppliers_scope3_category_fkey";

alter table "public"."ghg_targets" add constraint "ghg_targets_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."ghg_targets" validate constraint "ghg_targets_organization_id_fkey";

alter table "public"."ghg_uncertainty_analysis" add constraint "ghg_uncertainty_analysis_calculated_by_fkey" FOREIGN KEY (calculated_by) REFERENCES public.consultants(id) not valid;

alter table "public"."ghg_uncertainty_analysis" validate constraint "ghg_uncertainty_analysis_calculated_by_fkey";

alter table "public"."ghg_uncertainty_analysis" add constraint "ghg_uncertainty_analysis_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."ghg_uncertainty_analysis" validate constraint "ghg_uncertainty_analysis_organization_id_fkey";

alter table "public"."ghg_uncertainty_analysis" add constraint "ghg_uncertainty_analysis_source_register_id_fkey" FOREIGN KEY (source_register_id) REFERENCES public.ghg_emission_source_register(id) not valid;

alter table "public"."ghg_uncertainty_analysis" validate constraint "ghg_uncertainty_analysis_source_register_id_fkey";

alter table "public"."ghg_verification_findings" add constraint "ghg_verification_findings_verification_id_fkey" FOREIGN KEY (verification_id) REFERENCES public.ghg_verifications(id) not valid;

alter table "public"."ghg_verification_findings" validate constraint "ghg_verification_findings_verification_id_fkey";

alter table "public"."ghg_verification_responses" add constraint "ghg_verification_responses_finding_id_fkey" FOREIGN KEY (finding_id) REFERENCES public.ghg_verification_findings(id) not valid;

alter table "public"."ghg_verification_responses" validate constraint "ghg_verification_responses_finding_id_fkey";

alter table "public"."ghg_verification_responses" add constraint "ghg_verification_responses_responded_by_fkey" FOREIGN KEY (responded_by) REFERENCES public.consultants(id) not valid;

alter table "public"."ghg_verification_responses" validate constraint "ghg_verification_responses_responded_by_fkey";

alter table "public"."ghg_verification_responses" add constraint "ghg_verification_responses_supporting_doc_id_fkey" FOREIGN KEY (supporting_doc_id) REFERENCES public.ghg_documents(id) not valid;

alter table "public"."ghg_verification_responses" validate constraint "ghg_verification_responses_supporting_doc_id_fkey";

alter table "public"."ghg_verifications" add constraint "ghg_verifications_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."ghg_verifications" validate constraint "ghg_verifications_organization_id_fkey";

alter table "public"."ghg_verifications" add constraint "ghg_verifications_submission_id_fkey" FOREIGN KEY (submission_id) REFERENCES public.ghg_submissions(id) not valid;

alter table "public"."ghg_verifications" validate constraint "ghg_verifications_submission_id_fkey";

alter table "public"."ghg_verifications" add constraint "ghg_verifications_verifier_id_fkey" FOREIGN KEY (verifier_id) REFERENCES public.verifiers(id) not valid;

alter table "public"."ghg_verifications" validate constraint "ghg_verifications_verifier_id_fkey";

alter table "public"."gwp_factors" add constraint "gwp_factors_gas_id_key" UNIQUE using index "gwp_factors_gas_id_key";

alter table "public"."industry_benchmarks" add constraint "industry_benchmarks_industry_segment_id_fkey" FOREIGN KEY (industry_segment_id) REFERENCES public.ghg_industry_segments(id) not valid;

alter table "public"."industry_benchmarks" validate constraint "industry_benchmarks_industry_segment_id_fkey";

alter table "public"."industry_benchmarks" add constraint "industry_benchmarks_industry_segment_id_fy_year_scope_metri_key" UNIQUE using index "industry_benchmarks_industry_segment_id_fy_year_scope_metri_key";

alter table "public"."industry_benchmarks" add constraint "industry_benchmarks_scope_check" CHECK ((scope = ANY (ARRAY[1, 2, 3]))) not valid;

alter table "public"."industry_benchmarks" validate constraint "industry_benchmarks_scope_check";

alter table "public"."leads" add constraint "chk_leads_email_format" CHECK ((email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'::text)) not valid;

alter table "public"."leads" validate constraint "chk_leads_email_format";

alter table "public"."mfa_enforcement_config" add constraint "mfa_enforcement_config_role_name_key" UNIQUE using index "mfa_enforcement_config_role_name_key";

alter table "public"."platform_permissions" add constraint "platform_permissions_permission_code_key" UNIQUE using index "platform_permissions_permission_code_key";

alter table "public"."platform_roles" add constraint "platform_roles_role_name_key" UNIQUE using index "platform_roles_role_name_key";

alter table "public"."product_emissions" add constraint "product_emissions_facility_id_fkey" FOREIGN KEY (facility_id) REFERENCES public.client_sites(id) not valid;

alter table "public"."product_emissions" validate constraint "product_emissions_facility_id_fkey";

alter table "public"."product_emissions" add constraint "product_emissions_model_id_fkey" FOREIGN KEY (model_id) REFERENCES public.ai_models(id) not valid;

alter table "public"."product_emissions" validate constraint "product_emissions_model_id_fkey";

alter table "public"."product_emissions" add constraint "product_emissions_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."product_emissions" validate constraint "product_emissions_organization_id_fkey";

alter table "public"."product_emissions" add constraint "product_emissions_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) not valid;

alter table "public"."product_emissions" validate constraint "product_emissions_product_id_fkey";

alter table "public"."product_emissions" add constraint "product_emissions_verified_by_fkey" FOREIGN KEY (verified_by) REFERENCES public.consultants(id) not valid;

alter table "public"."product_emissions" validate constraint "product_emissions_verified_by_fkey";

alter table "public"."rate_limit_config" add constraint "rate_limit_config_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."rate_limit_config" validate constraint "rate_limit_config_organization_id_fkey";

alter table "public"."regulatory_filings" add constraint "chk_filing_status" CHECK ((status = ANY (ARRAY['not_started'::text, 'in_progress'::text, 'under_review'::text, 'submitted'::text, 'accepted'::text, 'rejected'::text, 'waived'::text]))) not valid;

alter table "public"."regulatory_filings" validate constraint "chk_filing_status";

alter table "public"."regulatory_filings" add constraint "regulatory_filings_framework_id_fkey" FOREIGN KEY (framework_id) REFERENCES public.disclosure_frameworks(id) not valid;

alter table "public"."regulatory_filings" validate constraint "regulatory_filings_framework_id_fkey";

alter table "public"."regulatory_filings" add constraint "regulatory_filings_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."regulatory_filings" validate constraint "regulatory_filings_organization_id_fkey";

alter table "public"."regulatory_filings" add constraint "regulatory_filings_organization_id_framework_id_fy_year_key" UNIQUE using index "regulatory_filings_organization_id_framework_id_fy_year_key";

alter table "public"."regulatory_filings" add constraint "regulatory_filings_submission_doc_id_fkey" FOREIGN KEY (submission_doc_id) REFERENCES public.ghg_documents(id) not valid;

alter table "public"."regulatory_filings" validate constraint "regulatory_filings_submission_doc_id_fkey";

alter table "public"."role_permissions" add constraint "role_permissions_permission_id_fkey" FOREIGN KEY (permission_id) REFERENCES public.platform_permissions(id) ON DELETE CASCADE not valid;

alter table "public"."role_permissions" validate constraint "role_permissions_permission_id_fkey";

alter table "public"."role_permissions" add constraint "role_permissions_role_id_fkey" FOREIGN KEY (role_id) REFERENCES public.platform_roles(id) ON DELETE CASCADE not valid;

alter table "public"."role_permissions" validate constraint "role_permissions_role_id_fkey";

alter table "public"."ropa_entries" add constraint "chk_ropa_legal_basis" CHECK ((legal_basis = ANY (ARRAY['consent'::text, 'legitimate_interest'::text, 'contract'::text, 'legal_obligation'::text, 'vital_interest'::text, 'public_task'::text]))) not valid;

alter table "public"."ropa_entries" validate constraint "chk_ropa_legal_basis";

alter table "public"."ropa_entries" add constraint "ropa_entries_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."ropa_entries" validate constraint "ropa_entries_created_by_fkey";

alter table "public"."sbti_milestones" add constraint "sbti_milestones_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."sbti_milestones" validate constraint "sbti_milestones_organization_id_fkey";

alter table "public"."sbti_milestones" add constraint "sbti_milestones_target_id_fkey" FOREIGN KEY (target_id) REFERENCES public.ghg_targets(id) not valid;

alter table "public"."sbti_milestones" validate constraint "sbti_milestones_target_id_fkey";

alter table "public"."sbti_milestones" add constraint "sbti_milestones_target_id_milestone_year_key" UNIQUE using index "sbti_milestones_target_id_milestone_year_key";

alter table "public"."sector_field_templates" add constraint "sector_field_templates_emission_factor_id_fkey" FOREIGN KEY (emission_factor_id) REFERENCES public.emission_factors(id) not valid;

alter table "public"."sector_field_templates" validate constraint "sector_field_templates_emission_factor_id_fkey";

alter table "public"."sector_field_templates" add constraint "sector_field_templates_segment_id_field_key_key" UNIQUE using index "sector_field_templates_segment_id_field_key_key";

alter table "public"."sector_field_templates" add constraint "sector_field_templates_segment_id_fkey" FOREIGN KEY (segment_id) REFERENCES public.ghg_industry_segments(id) not valid;

alter table "public"."sector_field_templates" validate constraint "sector_field_templates_segment_id_fkey";

alter table "public"."security_incidents" add constraint "chk_incident_severity" CHECK ((severity = ANY (ARRAY['critical'::text, 'high'::text, 'medium'::text, 'low'::text, 'informational'::text]))) not valid;

alter table "public"."security_incidents" validate constraint "chk_incident_severity";

alter table "public"."security_incidents" add constraint "chk_incident_status" CHECK ((status = ANY (ARRAY['detected'::text, 'triage'::text, 'investigating'::text, 'contained'::text, 'eradicated'::text, 'recovering'::text, 'resolved'::text, 'closed'::text, 'false_positive'::text]))) not valid;

alter table "public"."security_incidents" validate constraint "chk_incident_status";

alter table "public"."security_incidents" add constraint "chk_incident_type" CHECK ((incident_type = ANY (ARRAY['data_breach'::text, 'unauthorized_access'::text, 'system_outage'::text, 'malware'::text, 'phishing'::text, 'insider_threat'::text, 'ddos'::text, 'data_corruption'::text, 'misconfiguration'::text, 'supply_chain'::text, 'other'::text]))) not valid;

alter table "public"."security_incidents" validate constraint "chk_incident_type";

alter table "public"."security_incidents" add constraint "security_incidents_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."security_incidents" validate constraint "security_incidents_assigned_to_fkey";

alter table "public"."security_incidents" add constraint "security_incidents_reported_by_fkey" FOREIGN KEY (reported_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."security_incidents" validate constraint "security_incidents_reported_by_fkey";

alter table "public"."supplier_emissions" add constraint "supplier_emissions_emission_factor_id_fkey" FOREIGN KEY (emission_factor_id) REFERENCES public.emission_factors(id) not valid;

alter table "public"."supplier_emissions" validate constraint "supplier_emissions_emission_factor_id_fkey";

alter table "public"."supplier_emissions" add constraint "supplier_emissions_model_id_fkey" FOREIGN KEY (model_id) REFERENCES public.ai_models(id) not valid;

alter table "public"."supplier_emissions" validate constraint "supplier_emissions_model_id_fkey";

alter table "public"."supplier_emissions" add constraint "supplier_emissions_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."supplier_emissions" validate constraint "supplier_emissions_organization_id_fkey";

alter table "public"."supplier_emissions" add constraint "supplier_emissions_supplier_id_fkey" FOREIGN KEY (supplier_id) REFERENCES public.ghg_suppliers(id) not valid;

alter table "public"."supplier_emissions" validate constraint "supplier_emissions_supplier_id_fkey";

alter table "public"."user_organization_roles" add constraint "uor_org_fk" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) ON DELETE CASCADE not valid;

alter table "public"."user_organization_roles" validate constraint "uor_org_fk";

alter table "public"."user_organization_roles" add constraint "user_organization_roles_role_id_fkey" FOREIGN KEY (role_id) REFERENCES public.platform_roles(id) not valid;

alter table "public"."user_organization_roles" validate constraint "user_organization_roles_role_id_fkey";

alter table "public"."user_sessions" add constraint "chk_session_device_type" CHECK (((device_type = ANY (ARRAY['desktop'::text, 'mobile'::text, 'tablet'::text, 'api'::text, 'unknown'::text])) OR (device_type IS NULL))) not valid;

alter table "public"."user_sessions" validate constraint "chk_session_device_type";

alter table "public"."user_sessions" add constraint "user_sessions_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."user_sessions" validate constraint "user_sessions_organization_id_fkey";

alter table "public"."user_sessions" add constraint "user_sessions_session_token_hash_key" UNIQUE using index "user_sessions_session_token_hash_key";

alter table "public"."vendor_security_assessments" add constraint "chk_data_access" CHECK ((data_access_level = ANY (ARRAY['no_access'::text, 'metadata_only'::text, 'anonymized'::text, 'pseudonymized'::text, 'personal'::text, 'sensitive'::text, 'critical'::text]))) not valid;

alter table "public"."vendor_security_assessments" validate constraint "chk_data_access";

alter table "public"."vendor_security_assessments" add constraint "chk_vendor_risk" CHECK ((inherent_risk_level = ANY (ARRAY['critical'::text, 'high'::text, 'medium'::text, 'low'::text]))) not valid;

alter table "public"."vendor_security_assessments" validate constraint "chk_vendor_risk";

alter table "public"."vendor_security_assessments" add constraint "chk_vendor_type" CHECK ((vendor_type = ANY (ARRAY['cloud_infrastructure'::text, 'payment_processing'::text, 'ai_ml_provider'::text, 'erp_integration'::text, 'communication'::text, 'analytics'::text, 'identity_provider'::text, 'storage'::text, 'other'::text]))) not valid;

alter table "public"."vendor_security_assessments" validate constraint "chk_vendor_type";

alter table "public"."vendor_security_assessments" add constraint "vendor_security_assessments_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."vendor_security_assessments" validate constraint "vendor_security_assessments_created_by_fkey";

alter table "public"."verifiers" add constraint "verifiers_email_key" UNIQUE using index "verifiers_email_key";

alter table "public"."verifiers" add constraint "verifiers_user_id_key" UNIQUE using index "verifiers_user_id_key";

alter table "public"."webhook_delivery_log" add constraint "webhook_delivery_log_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."webhook_delivery_log" validate constraint "webhook_delivery_log_organization_id_fkey";

alter table "public"."webhook_delivery_log" add constraint "webhook_delivery_log_subscription_id_fkey" FOREIGN KEY (subscription_id) REFERENCES public.webhook_subscriptions(id) not valid;

alter table "public"."webhook_delivery_log" validate constraint "webhook_delivery_log_subscription_id_fkey";

alter table "public"."webhook_subscriptions" add constraint "webhook_subscriptions_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) ON DELETE RESTRICT not valid;

alter table "public"."webhook_subscriptions" validate constraint "webhook_subscriptions_organization_id_fkey";

alter table "public"."activity_data" add constraint "activity_data_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id) not valid;

alter table "public"."activity_data" validate constraint "activity_data_organization_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.compute_ccpa_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
    -- due_at: CCPA allows 45 days
    IF NEW.due_at IS NULL OR TG_OP = 'INSERT' THEN
        NEW.due_at := NEW.requested_at + INTERVAL '45 days';
    END IF;

    -- sla_met
    IF NEW.fulfilled_at IS NOT NULL THEN
        NEW.sla_met := NEW.fulfilled_at <= NEW.requested_at + INTERVAL '45 days';
    ELSE
        NEW.sla_met := NULL;
    END IF;

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.compute_dsar_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
    -- due_at: always 30 days from requested_at
    IF NEW.due_at IS NULL OR TG_OP = 'INSERT' THEN
        NEW.due_at := NEW.requested_at + INTERVAL '30 days';
    END IF;

    -- sla_met: set once fulfilled_at is populated
    IF NEW.fulfilled_at IS NOT NULL THEN
        NEW.sla_met := NEW.fulfilled_at <= NEW.requested_at + INTERVAL '30 days';
    ELSE
        NEW.sla_met := NULL;
    END IF;

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.compute_incident_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
    -- incident_ref: generated once on INSERT — INC-YYYYMMDD-XXXXXX
    IF TG_OP = 'INSERT' OR NEW.incident_ref IS NULL THEN
        NEW.incident_ref := 'INC-' ||
            to_char(COALESCE(NEW.created_at, now()), 'YYYYMMDD') ||
            '-' ||
            upper(substring(NEW.id::TEXT, 1, 6));
    END IF;

    -- dpa_notification_deadline: detected_at + 72 hours when required
    IF NEW.dpa_notification_required = TRUE THEN
        NEW.dpa_notification_deadline := NEW.detected_at + INTERVAL '72 hours';
    ELSE
        NEW.dpa_notification_deadline := NULL;
    END IF;

    -- dpa_72h_sla_met: did we notify the DPA within 72 hours?
    IF NEW.dpa_notification_required = TRUE AND NEW.dpa_notified_at IS NOT NULL THEN
        NEW.dpa_72h_sla_met := NEW.dpa_notified_at <= NEW.detected_at + INTERVAL '72 hours';
    ELSE
        NEW.dpa_72h_sla_met := NULL;
    END IF;

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.compute_portability_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
    -- due_at: 30 days from request
    IF NEW.due_at IS NULL OR TG_OP = 'INSERT' THEN
        NEW.due_at := NEW.requested_at + INTERVAL '30 days';
    END IF;

    -- expires_at: 7 days after the file is ready
    IF NEW.ready_at IS NOT NULL THEN
        NEW.expires_at := NEW.ready_at + INTERVAL '7 days';
    ELSE
        NEW.expires_at := NULL;
    END IF;

    -- sla_met: did we deliver the file within 30 days?
    IF NEW.ready_at IS NOT NULL THEN
        NEW.sla_met := NEW.ready_at <= NEW.requested_at + INTERVAL '30 days';
    ELSE
        NEW.sla_met := NULL;
    END IF;

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.compute_ropa_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
    -- next_review_due: 1 year after last review
    IF NEW.last_reviewed_at IS NOT NULL THEN
        NEW.next_review_due := NEW.last_reviewed_at + INTERVAL '1 year';
    ELSE
        NEW.next_review_due := NULL;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.compute_vendor_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
    -- next_assessment_due: annual review cycle
    IF NEW.last_assessment_date IS NOT NULL THEN
        NEW.next_assessment_due := (NEW.last_assessment_date + INTERVAL '1 year')::DATE;
    ELSE
        NEW.next_assessment_due := NULL;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_signoff_signature(p_user_id uuid, p_submission_id uuid, p_declaration text, p_timestamp timestamp with time zone)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
    v_payload TEXT;
    v_secret  TEXT;
BEGIN
    v_secret := current_setting('app.settings.signoff_hmac_secret', TRUE);

    -- DB-005: MUST raise if secret missing or is the placeholder.
    -- Edge Function must call: SET LOCAL app.settings.signoff_hmac_secret = '<vault_value>';
    -- BEFORE invoking any signoff operation.
    IF v_secret IS NULL
       OR trim(v_secret) = ''
       OR v_secret = 'REPLACE_WITH_VAULT_SECRET_IN_PRODUCTION' THEN
        RAISE EXCEPTION
            'SECURITY_VIOLATION [R-01/DB-005]: app.settings.signoff_hmac_secret is '
            'not set or still contains the placeholder value. '
            'The calling Edge Function MUST set this via Supabase Vault before '
            'invoking generate_signoff_signature(). '
            'No signoff signature can be generated without a valid secret.';
    END IF;

    v_payload :=
        p_user_id::TEXT       || '|' ||
        p_submission_id::TEXT  || '|' ||
        p_declaration          || '|' ||
        to_char(p_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"');

    RETURN encode(
        extensions.hmac(v_payload::BYTEA, v_secret::BYTEA, 'sha256'),
        'hex'
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_compliance_dashboard()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'generated_at', now(),

        -- GDPR breach notifications breaching 72-hour window
        'dpa_notifications_overdue', (
            SELECT COUNT(*) FROM public.security_incidents
            WHERE dpa_notification_required = TRUE
            AND dpa_notified_at IS NULL
            AND detected_at + INTERVAL '72 hours' < now()
            AND status NOT IN ('false_positive','closed')
        ),

        -- DSARs overdue (past 30-day SLA)
        'dsar_overdue', (
            SELECT COUNT(*) FROM public.data_subject_access_requests
            WHERE status NOT IN ('fulfilled','rejected','withdrawn')
            AND due_at < now()
        ),

        -- CCPA requests overdue (past 45-day SLA)
        'ccpa_requests_overdue', (
            SELECT COUNT(*) FROM public.consumer_data_requests
            WHERE status NOT IN ('fulfilled','rejected','withdrawn')
            AND due_at < now()
        ),

        -- Active critical/high security incidents
        'open_critical_incidents', (
            SELECT COUNT(*) FROM public.security_incidents
            WHERE severity IN ('critical','high')
            AND status NOT IN ('resolved','closed','false_positive')
        ),

        -- Vendor assessments overdue for annual review
        'vendors_overdue_assessment', (
            SELECT COUNT(*) FROM public.vendor_security_assessments
            WHERE is_active = TRUE
            AND next_assessment_due < CURRENT_DATE
        ),

        -- ROPA entries needing annual review
        'ropa_entries_due_review', (
            SELECT COUNT(*) FROM public.ropa_entries
            WHERE is_active = TRUE
            AND (last_reviewed_at IS NULL OR last_reviewed_at < now() - INTERVAL '1 year')
        ),

        -- Export requests ready but not downloaded and expiring soon
        'exports_expiring_24h', (
            SELECT COUNT(*) FROM public.data_portability_exports
            WHERE status = 'ready'
            AND expires_at < now() + INTERVAL '24 hours'
            AND expires_at > now()
        ),

        -- Hash chain integrity (last 24 hours)
        'hash_chain_status', (
            SELECT chain_status FROM public.verify_audit_hash_chain(
                NULL,
                now() - INTERVAL '24 hours',
                now()
            )
        )
    ) INTO v_result;

    RETURN v_result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_erp_secret(p_vault_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public', 'extensions'
AS $function$
DECLARE
    v_enc BYTEA;
    v_key TEXT;
BEGIN
    IF auth.role() NOT IN ('service_role') THEN
        RAISE EXCEPTION 'Access denied: secrets are service_role only';
    END IF;
    SELECT encrypted_value INTO v_enc
    FROM   public.erp_connection_vault
    WHERE  id = p_vault_id AND is_active = TRUE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Vault entry not found or inactive';
    END IF;
    v_key := current_setting('app.settings.vault_encryption_key', TRUE);
    IF v_key IS NULL OR v_key = '' THEN
        RAISE EXCEPTION 'SECURITY_VIOLATION: vault_encryption_key not set';
    END IF;
    RETURN extensions.pgp_sym_decrypt(v_enc, v_key)::TEXT;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_annual_emissions()
 RETURNS SETOF public.mv_org_annual_emissions
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
    SELECT * FROM public.mv_org_annual_emissions
    WHERE  organization_id = ANY(public.my_org_ids())
$function$
;

CREATE OR REPLACE FUNCTION public.ghg_audit_hash_chain()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
    v_prev_hash TEXT;
    v_payload   TEXT;
BEGIN
    SELECT event_hash INTO v_prev_hash
    FROM   public.ghg_audit_log
    WHERE  organization_id = NEW.organization_id
    ORDER  BY id DESC
    LIMIT  1;

    v_prev_hash := COALESCE(v_prev_hash, 'GENESIS');

    v_payload :=
        COALESCE(v_prev_hash, '')                   ||
        COALESCE(NEW.table_name, '')                ||
        COALESCE(NEW.record_id::TEXT, '')           ||
        COALESCE(NEW.operation, '')                 ||
        COALESCE(NEW.changed_by_user_id::TEXT, '')  ||
        to_char(NEW.event_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"');

    NEW.previous_hash := v_prev_hash;
    NEW.event_hash    := encode(extensions.digest(v_payload, 'sha256'), 'hex');

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.ghg_audit_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
    v_record_id      UUID;
    v_org_id         UUID;
    v_postlock       BOOLEAN  := FALSE;
    v_ip_raw         TEXT;
    v_ip             INET;
    v_role           TEXT;
    v_session_id     TEXT;
    v_user_agent     TEXT;
    v_changed_fields TEXT[];
    v_req_hdrs       JSONB;
BEGIN
    -- ── Identify record and org ──────────────────────────────────────────────
    v_record_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END;
    BEGIN
        v_org_id := CASE WHEN TG_OP = 'DELETE'
                    THEN (row_to_json(OLD) ->> 'organization_id')::UUID
                    ELSE (row_to_json(NEW) ->> 'organization_id')::UUID END;
    EXCEPTION WHEN OTHERS THEN v_org_id := NULL; END;

    -- ── Post-lock detection (immutability guard) ─────────────────────────────
    IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'ghg_monthly_readings' THEN
        IF OLD.is_locked = TRUE THEN v_postlock := TRUE; END IF;
    END IF;

    -- ── IP address (DB-010) ──────────────────────────────────────────────────
    v_ip_raw := nullif(trim(current_setting('app.settings.current_ip', TRUE)), '');
    IF v_ip_raw IS NULL THEN
        BEGIN
            v_req_hdrs := current_setting('request.headers', TRUE)::JSONB;
            v_ip_raw := COALESCE(
                nullif(trim(v_req_hdrs ->> 'x-real-ip'), ''),
                nullif(trim(split_part(v_req_hdrs ->> 'x-forwarded-for', ',', 1)), '')
            );
        EXCEPTION WHEN OTHERS THEN NULL; END;
    END IF;
    BEGIN
        IF v_ip_raw IS NOT NULL THEN v_ip := v_ip_raw::INET; END IF;
    EXCEPTION WHEN OTHERS THEN v_ip := NULL; END;

    -- ── Role from JWT app_metadata → fallback to auth.role() ────────────────
    BEGIN
        v_role := COALESCE(
            nullif(trim(auth.jwt() -> 'app_metadata' ->> 'primary_role'), ''),
            auth.role()
        );
    EXCEPTION WHEN OTHERS THEN
        BEGIN v_role := auth.role(); EXCEPTION WHEN OTHERS THEN v_role := 'unknown'; END;
    END;

    -- ── JWT session ID (jti claim) ───────────────────────────────────────────
    BEGIN v_session_id := auth.jwt() ->> 'jti'; EXCEPTION WHEN OTHERS THEN NULL; END;

    -- ── User-agent from request headers ─────────────────────────────────────
    BEGIN
        IF v_req_hdrs IS NULL THEN
            v_req_hdrs := current_setting('request.headers', TRUE)::JSONB;
        END IF;
        v_user_agent := v_req_hdrs ->> 'user-agent';
    EXCEPTION WHEN OTHERS THEN NULL; END;

    -- ── Changed fields: JSON diff for UPDATE only ────────────────────────────
    IF TG_OP = 'UPDATE' THEN
        SELECT ARRAY_AGG(n.key ORDER BY n.key)
        INTO   v_changed_fields
        FROM   jsonb_each_text(row_to_json(NEW)::JSONB) AS n(key, new_val)
        JOIN   jsonb_each_text(row_to_json(OLD)::JSONB) AS o(key, old_val)
               ON n.key = o.key
        WHERE  n.new_val IS DISTINCT FROM o.old_val;
    END IF;

    -- ── Write audit record ───────────────────────────────────────────────────
    INSERT INTO public.ghg_audit_log (
        table_name,         record_id,          organization_id,
        operation,          changed_by_user_id,  changed_by_role,
        changed_by_ip,      session_id,          user_agent,
        old_data,           new_data,            changed_fields,
        is_post_lock_change
    ) VALUES (
        TG_TABLE_NAME,      v_record_id,         v_org_id,
        TG_OP,              auth.uid(),           v_role,
        v_ip,               v_session_id,         v_user_agent,
        CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN row_to_json(OLD)::JSONB ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT','UPDATE')  THEN row_to_json(NEW)::JSONB ELSE NULL END,
        v_changed_fields,
        v_postlock
    );

    RETURN COALESCE(NEW, OLD);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.has_permission(p_org_id uuid, p_permission text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM   public.user_organization_roles uor
        JOIN   public.role_permissions        rp  ON rp.role_id       = uor.role_id
        JOIN   public.platform_permissions    pp  ON pp.id            = rp.permission_id
        WHERE  uor.user_id         = auth.uid()
        AND    uor.organization_id = p_org_id
        AND    uor.is_active       = TRUE
        AND    pp.permission_code  = p_permission
    )
$function$
;

CREATE OR REPLACE FUNCTION public.is_feature_enabled(p_flag_key text, p_org_id uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
    v_flag public.feature_flags%ROWTYPE;
BEGIN
    SELECT * INTO v_flag FROM public.feature_flags WHERE flag_key = p_flag_key;
    IF NOT FOUND THEN RETURN FALSE; END IF;
    IF v_flag.enabled_globally THEN RETURN TRUE; END IF;
    IF auth.uid() = ANY(v_flag.enabled_for_user_ids) THEN RETURN TRUE; END IF;
    IF p_org_id IS NOT NULL AND p_org_id = ANY(v_flag.enabled_for_org_ids) THEN RETURN TRUE; END IF;
    RETURN FALSE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.leads_spam_protection()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
    v_recent_count INTEGER;
    v_ip_raw       TEXT;
    v_ip_count     INTEGER;
BEGIN
    -- Normalize email
    NEW.email := lower(trim(NEW.email));

    -- Rate limit: max 5 submissions per email per hour
    SELECT COUNT(*) INTO v_recent_count
    FROM   public.leads
    WHERE  lower(trim(email)) = NEW.email
    AND    created_at > now() - INTERVAL '1 hour';

    IF v_recent_count >= 5 THEN
        RAISE EXCEPTION 'RATE_LIMIT_EXCEEDED: Maximum 5 submissions per email per hour.'
            USING ERRCODE = '23514';
    END IF;

    -- Rate limit per IP: max 20 submissions per IP per hour
    IF NEW.ip_address IS NOT NULL THEN
        SELECT COUNT(*) INTO v_ip_count
        FROM   public.leads
        WHERE  ip_address = NEW.ip_address
        AND    created_at > now() - INTERVAL '1 hour';

        IF v_ip_count >= 20 THEN
            RAISE EXCEPTION 'RATE_LIMIT_EXCEEDED: Too many submissions from this IP address.'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    -- Capture IP from session setting if not explicitly provided
    IF NEW.ip_address IS NULL THEN
        v_ip_raw := nullif(trim(current_setting('app.settings.current_ip', TRUE)), '');
        IF v_ip_raw IS NULL THEN
            BEGIN
                v_ip_raw := nullif(trim(
                    (current_setting('request.headers', TRUE)::JSONB) ->> 'x-real-ip'
                ), '');
            EXCEPTION WHEN OTHERS THEN NULL; END;
        END IF;
        BEGIN
            IF v_ip_raw IS NOT NULL THEN
                NEW.ip_address := v_ip_raw::INET;
            END IF;
        EXCEPTION WHEN OTHERS THEN NULL; END;
    END IF;

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.lock_readings_on_submission()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW.status = 'under_verification' AND OLD.status != 'under_verification' THEN
        UPDATE public.ghg_monthly_readings
        SET is_locked = TRUE WHERE submission_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$function$
;

create materialized view "public"."mv_ai_validation_summary" as  SELECT organization_id,
    table_name,
    validation_status,
    risk_level,
    count(*) AS record_count,
    avg(trust_score) AS avg_trust,
    avg(anomaly_score) AS avg_anomaly_score,
    sum(
        CASE
            WHEN flagged_for_audit THEN 1
            ELSE 0
        END) AS flagged_count,
    now() AS refreshed_at
   FROM public.ai_validation
  GROUP BY organization_id, table_name, validation_status, risk_level;


create materialized view "public"."mv_org_annual_emissions" as  SELECT organization_id,
    fy_year,
    scope,
    (sum(kgco2e_total) / 1000.0) AS tco2e_total,
    (sum(
        CASE
            WHEN (scope = 1) THEN kgco2e_total
            ELSE (0)::numeric
        END) / 1000.0) AS scope1_tco2e,
    (sum(
        CASE
            WHEN (scope = 2) THEN kgco2e_total
            ELSE (0)::numeric
        END) / 1000.0) AS scope2_tco2e,
    (sum(
        CASE
            WHEN (scope = 3) THEN kgco2e_total
            ELSE (0)::numeric
        END) / 1000.0) AS scope3_tco2e,
    count(*) AS reading_count,
    sum(
        CASE
            WHEN anomaly_flag THEN 1
            ELSE 0
        END) AS anomaly_count,
    sum(
        CASE
            WHEN is_estimated THEN 1
            ELSE 0
        END) AS estimated_count,
    avg(trust_score) AS avg_trust_score,
    now() AS refreshed_at
   FROM public.ghg_monthly_readings
  WHERE (status <> 'rejected'::text)
  GROUP BY organization_id, fy_year, scope;


create materialized view "public"."mv_site_emissions" as  SELECT organization_id,
    site_id,
    fy_year,
    scope,
    field_key,
    sum(kgco2e_total) AS kgco2e_total,
    sum(value) AS activity_total,
    unit,
    count(*) AS reading_count,
    now() AS refreshed_at
   FROM public.ghg_monthly_readings
  WHERE ((status <> 'rejected'::text) AND (site_id IS NOT NULL))
  GROUP BY organization_id, site_id, fy_year, scope, field_key, unit;


create materialized view "public"."mv_targets_progress" as  SELECT t.id AS target_id,
    t.organization_id,
    t.target_name,
    t.target_type,
    t.base_year,
    t.target_year,
    t.reduction_pct,
    t.scopes_covered,
    t.is_sbti_aligned,
    t.is_net_zero,
    by_.base_year_total_tco2e AS base_tco2e,
    curr.tco2e_total AS current_tco2e,
    round((by_.base_year_total_tco2e * ((1)::numeric - (t.reduction_pct / 100.0))), 2) AS target_tco2e,
        CASE
            WHEN (by_.base_year_total_tco2e > (0)::numeric) THEN round((((by_.base_year_total_tco2e - COALESCE(curr.tco2e_total, by_.base_year_total_tco2e)) / by_.base_year_total_tco2e) * 100.0), 2)
            ELSE (0)::numeric
        END AS achieved_reduction_pct,
        CASE
            WHEN ((by_.base_year_total_tco2e > (0)::numeric) AND ((t.target_year - (t.base_year)::integer) > 0)) THEN ((((by_.base_year_total_tco2e - COALESCE(curr.tco2e_total, by_.base_year_total_tco2e)) / by_.base_year_total_tco2e) * 100.0) >= ((t.reduction_pct * (EXTRACT(year FROM now()) - (t.base_year)::numeric)) / (NULLIF((t.target_year - (t.base_year)::integer), 0))::numeric))
            ELSE false
        END AS is_on_track,
    now() AS refreshed_at
   FROM ((public.ghg_targets t
     LEFT JOIN public.ghg_base_years by_ ON ((by_.organization_id = t.organization_id)))
     LEFT JOIN ( SELECT ghg_monthly_readings.organization_id,
            ghg_monthly_readings.fy_year,
            (sum(ghg_monthly_readings.kgco2e_total) / 1000.0) AS tco2e_total
           FROM public.ghg_monthly_readings
          WHERE (ghg_monthly_readings.status <> 'rejected'::text)
          GROUP BY ghg_monthly_readings.organization_id, ghg_monthly_readings.fy_year) curr ON (((curr.organization_id = t.organization_id) AND (curr.fy_year = ( SELECT max(ghg_monthly_readings.fy_year) AS max
           FROM public.ghg_monthly_readings
          WHERE (ghg_monthly_readings.organization_id = t.organization_id))))));


CREATE OR REPLACE FUNCTION public.my_org_ids()
 RETURNS uuid[]
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
    v_claim_orgs UUID[];
    v_raw        TEXT;
BEGIN
    BEGIN
        v_raw := (auth.jwt() -> 'app_metadata' ->> 'org_ids');
        IF v_raw IS NOT NULL AND v_raw != '' THEN
            SELECT ARRAY(
                SELECT elem::UUID
                FROM jsonb_array_elements_text(v_raw::JSONB) AS elem
            ) INTO v_claim_orgs;
            IF array_length(v_claim_orgs, 1) > 0 THEN
                RETURN v_claim_orgs;
            END IF;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Log instead of silently swallowing — per audit finding on error handling
        RAISE LOG 'my_org_ids: JWT org_ids parse failed for user %, error: %',
                  auth.uid(), SQLERRM;
    END;

    -- Fallback: query DB (used on first login before JWT claim is populated)
    RETURN ARRAY(
        SELECT organization_id
        FROM   public.user_organization_roles
        WHERE  user_id   = auth.uid()
        AND    is_active = TRUE
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.my_role_in_org(p_org_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
    SELECT pr.role_level
    FROM   public.user_organization_roles uor
    JOIN   public.platform_roles pr ON pr.id = uor.role_id
    WHERE  uor.user_id         = auth.uid()
    AND    uor.organization_id = p_org_id
    AND    uor.is_active       = TRUE
    ORDER  BY pr.role_level DESC
    LIMIT  1
$function$
;

CREATE OR REPLACE FUNCTION public.prevent_hard_delete()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    RAISE EXCEPTION
        'Hard delete blocked on %. Use soft-delete: SET deleted_at = now() WHERE id = %',
        TG_TABLE_NAME, OLD.id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.prevent_locked_update()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF OLD.is_locked = TRUE THEN
        RAISE EXCEPTION
            'Reading % is locked after verification. Use ghg_reading_amendments instead.', OLD.id;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.redact_old_erp_payloads()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE public.erp_sync_logs
    SET    raw_payload_sample = '{"redacted": "payload purged after 90-day retention"}'::JSONB,
           payload_purged_at  = now()
    WHERE  created_at < now() - INTERVAL '90 days'
    AND    raw_payload_sample IS NOT NULL
    AND    payload_purged_at IS NULL;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.refresh_dashboard_views()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_org_annual_emissions;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_site_emissions;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_ai_validation_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_targets_progress;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
 new.created_at = now();
 return new;
end;
$function$
;

create or replace view "public"."v_active_assets" as  SELECT id,
    site_id,
    organization_id,
    asset_name,
    asset_type,
    asset_tag,
    make,
    model,
    year_of_manufacture,
    installed_at,
    capacity,
    fuel_type,
    refrigerant_type,
    refrigerant_charge_kg,
    last_service_date,
    next_service_date,
    is_active,
    decommissioned_at,
    notes,
    erp_asset_code,
    created_at,
    updated_at,
    created_by,
    deleted_at,
    deleted_by
   FROM public.client_assets
  WHERE (deleted_at IS NULL);


create or replace view "public"."v_active_fleet" as  SELECT id,
    organization_id,
    legal_entity_id,
    site_id,
    registration_number,
    make,
    model,
    year_of_manufacture,
    vehicle_category,
    vehicle_use_type,
    fuel_type,
    engine_emission_standard,
    laden_capacity_tonnes,
    seating_capacity,
    fuel_efficiency_kmpl,
    fuel_efficiency_source,
    has_ac,
    ac_refrigerant_type,
    ac_refrigerant_charge_kg,
    is_reefer,
    reefer_refrigerant_type,
    reefer_refrigerant_charge_kg,
    ownership_type,
    boundary_inclusion,
    exclusion_justification,
    rc_number,
    rc_expiry,
    fitness_expiry,
    insurance_policy_no,
    insurance_expiry,
    puc_certificate_no,
    puc_expiry,
    puc_co_reading_pct,
    puc_hc_reading_ppm,
    gps_device_id,
    telematics_provider,
    acquisition_date,
    acquisition_cost_inr,
    disposal_date,
    disposal_method,
    is_active,
    erp_asset_code,
    created_at,
    updated_at,
    created_by,
    deleted_at,
    deleted_by
   FROM public.fleet_vehicles
  WHERE (deleted_at IS NULL);


create or replace view "public"."v_active_organizations" as  SELECT id,
    legal_name,
    trade_name,
    cin,
    gstin,
    pan,
    registered_address,
    city,
    state,
    pin_code,
    country,
    industry_segment_id,
    nic_code,
    employee_count_range,
    annual_turnover_cr,
    is_listed,
    stock_exchange,
    isin,
    brsr_required,
    brsr_core_required,
    reporting_currency,
    fiscal_year_start_month,
    consolidation_approach,
    consolidation_justification,
    gwp_basis,
    gwp_change_log,
    primary_contact_name,
    primary_contact_email,
    primary_contact_phone,
    primary_contact_designation,
    assigned_consultant_id,
    onboarded_at,
    is_active,
    erp_system_type,
    erp_tenant_code,
    erp_sync_enabled,
    created_at,
    updated_at,
    created_by,
    updated_by,
    deleted_at,
    deleted_by
   FROM public.client_organizations
  WHERE (deleted_at IS NULL);


create or replace view "public"."v_active_sites" as  SELECT id,
    organization_id,
    legal_entity_id,
    site_name,
    site_code,
    site_type,
    address,
    city,
    state,
    pin_code,
    latitude,
    longitude,
    floor_area_sqm,
    electricity_account_nos,
    discom_name,
    grid_zone,
    has_captive_solar,
    solar_capacity_kwp,
    has_dg_set,
    dg_capacity_kva,
    has_captive_water,
    is_in_boundary,
    exclusion_reason,
    included_from_fy,
    excluded_from_fy,
    is_active,
    erp_site_code,
    created_at,
    updated_at,
    created_by,
    updated_by,
    deleted_at,
    deleted_by
   FROM public.client_sites
  WHERE (deleted_at IS NULL);


create or replace view "public"."v_ai_models_safe" as  SELECT id,
    model_name,
    model_type,
    version,
    training_date,
    training_dataset,
    framework,
    algorithm,
    accuracy_metric,
    accuracy_value,
    model_metadata,
    is_active,
    deprecated_at,
    created_at
   FROM public.ai_models;


CREATE OR REPLACE FUNCTION public.verify_audit_hash_chain()
 RETURNS TABLE(total_entries bigint, broken_chain_count bigint, first_broken_id bigint, first_broken_ts timestamp with time zone, chain_status text, verified_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
    SELECT * FROM public.verify_audit_hash_chain(NULL, now() - INTERVAL '7 days', now())
$function$
;

CREATE OR REPLACE FUNCTION public.verify_audit_hash_chain(p_org_id uuid DEFAULT NULL::uuid, p_from_ts timestamp with time zone DEFAULT (now() - '7 days'::interval), p_to_ts timestamp with time zone DEFAULT now())
 RETURNS TABLE(total_entries bigint, broken_chain_count bigint, first_broken_id bigint, first_broken_ts timestamp with time zone, chain_status text, verified_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public', 'extensions'
AS $function$
DECLARE
    v_broken   BIGINT := 0;
    v_first_id BIGINT;
    v_first_ts TIMESTAMPTZ;
    v_total    BIGINT;
BEGIN
    -- Count total entries in window
    SELECT COUNT(*) INTO v_total
    FROM   public.ghg_audit_log
    WHERE  event_timestamp BETWEEN p_from_ts AND p_to_ts
    AND    (p_org_id IS NULL OR organization_id = p_org_id);

    -- Detect broken links: event_hash doesn't match recomputed hash
    SELECT COUNT(*), MIN(al.id), MIN(al.event_timestamp)
    INTO   v_broken, v_first_id, v_first_ts
    FROM   public.ghg_audit_log al
    WHERE  al.event_timestamp BETWEEN p_from_ts AND p_to_ts
    AND    (p_org_id IS NULL OR al.organization_id = p_org_id)
    AND    al.event_hash IS NOT NULL
    AND    al.event_hash != encode(
               extensions.digest(
                   COALESCE(al.previous_hash, 'GENESIS')  ||
                   COALESCE(al.table_name, '')             ||
                   COALESCE(al.record_id::TEXT, '')        ||
                   COALESCE(al.operation, '')              ||
                   COALESCE(al.changed_by_user_id::TEXT, '') ||
                   to_char(al.event_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
                   'sha256'
               ),
               'hex'
           );

    RETURN QUERY SELECT
        v_total,
        v_broken,
        v_first_id,
        v_first_ts,
        CASE
            WHEN v_broken = 0 THEN 'INTACT — hash chain verified'
            ELSE 'BROKEN — ' || v_broken || ' tampered entries detected. SECURITY ALERT.'
        END,
        now();
END;
$function$
;

CREATE OR REPLACE FUNCTION public.audit_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
    v_ip_raw TEXT;
    v_ip     INET;
    v_hdrs   JSONB;
BEGIN
    v_ip_raw := nullif(trim(current_setting('app.settings.current_ip', TRUE)), '');
    IF v_ip_raw IS NULL THEN
        BEGIN
            v_hdrs   := current_setting('request.headers', TRUE)::JSONB;
            v_ip_raw := COALESCE(
                nullif(trim(v_hdrs ->> 'x-real-ip'), ''),
                nullif(trim(split_part(v_hdrs ->> 'x-forwarded-for', ',', 1)), '')
            );
        EXCEPTION WHEN OTHERS THEN NULL; END;
    END IF;
    BEGIN
        IF v_ip_raw IS NOT NULL THEN v_ip := v_ip_raw::INET; END IF;
    EXCEPTION WHEN OTHERS THEN v_ip := NULL; END;

    INSERT INTO public.ghg_audit_log (
        table_name,  record_id,                 operation,
        old_data,    new_data,                  changed_by_user_id,
        changed_by_ip
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::JSONB ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN row_to_json(NEW)::JSONB ELSE NULL END,
        auth.uid(),
        v_ip
    );
    RETURN COALESCE(NEW, OLD);
END;
$function$
;

CREATE UNIQUE INDEX mv_ai_val_pk ON public.mv_ai_validation_summary USING btree (organization_id, table_name, validation_status, risk_level);

CREATE UNIQUE INDEX mv_ann_emits_pk ON public.mv_org_annual_emissions USING btree (organization_id, fy_year, scope);

CREATE UNIQUE INDEX mv_site_emits_pk ON public.mv_site_emissions USING btree (organization_id, site_id, fy_year, scope, field_key);

CREATE UNIQUE INDEX mv_targets_pk ON public.mv_targets_progress USING btree (target_id);

grant delete on table "public"."ai_models" to "anon";

grant insert on table "public"."ai_models" to "anon";

grant references on table "public"."ai_models" to "anon";

grant select on table "public"."ai_models" to "anon";

grant trigger on table "public"."ai_models" to "anon";

grant truncate on table "public"."ai_models" to "anon";

grant update on table "public"."ai_models" to "anon";

grant select on table "public"."ai_models" to "authenticated";

grant delete on table "public"."ai_models" to "service_role";

grant insert on table "public"."ai_models" to "service_role";

grant references on table "public"."ai_models" to "service_role";

grant select on table "public"."ai_models" to "service_role";

grant trigger on table "public"."ai_models" to "service_role";

grant truncate on table "public"."ai_models" to "service_role";

grant update on table "public"."ai_models" to "service_role";

grant delete on table "public"."ai_validation" to "anon";

grant insert on table "public"."ai_validation" to "anon";

grant references on table "public"."ai_validation" to "anon";

grant select on table "public"."ai_validation" to "anon";

grant trigger on table "public"."ai_validation" to "anon";

grant truncate on table "public"."ai_validation" to "anon";

grant update on table "public"."ai_validation" to "anon";

grant insert on table "public"."ai_validation" to "authenticated";

grant select on table "public"."ai_validation" to "authenticated";

grant update on table "public"."ai_validation" to "authenticated";

grant delete on table "public"."ai_validation" to "service_role";

grant insert on table "public"."ai_validation" to "service_role";

grant references on table "public"."ai_validation" to "service_role";

grant select on table "public"."ai_validation" to "service_role";

grant trigger on table "public"."ai_validation" to "service_role";

grant truncate on table "public"."ai_validation" to "service_role";

grant update on table "public"."ai_validation" to "service_role";

grant delete on table "public"."api_keys" to "anon";

grant insert on table "public"."api_keys" to "anon";

grant references on table "public"."api_keys" to "anon";

grant select on table "public"."api_keys" to "anon";

grant trigger on table "public"."api_keys" to "anon";

grant truncate on table "public"."api_keys" to "anon";

grant update on table "public"."api_keys" to "anon";

grant delete on table "public"."api_keys" to "authenticated";

grant insert on table "public"."api_keys" to "authenticated";

grant references on table "public"."api_keys" to "authenticated";

grant select on table "public"."api_keys" to "authenticated";

grant trigger on table "public"."api_keys" to "authenticated";

grant truncate on table "public"."api_keys" to "authenticated";

grant update on table "public"."api_keys" to "authenticated";

grant delete on table "public"."api_keys" to "service_role";

grant insert on table "public"."api_keys" to "service_role";

grant references on table "public"."api_keys" to "service_role";

grant select on table "public"."api_keys" to "service_role";

grant trigger on table "public"."api_keys" to "service_role";

grant truncate on table "public"."api_keys" to "service_role";

grant update on table "public"."api_keys" to "service_role";

grant delete on table "public"."carbon_offset_registries" to "anon";

grant insert on table "public"."carbon_offset_registries" to "anon";

grant references on table "public"."carbon_offset_registries" to "anon";

grant select on table "public"."carbon_offset_registries" to "anon";

grant trigger on table "public"."carbon_offset_registries" to "anon";

grant truncate on table "public"."carbon_offset_registries" to "anon";

grant update on table "public"."carbon_offset_registries" to "anon";

grant delete on table "public"."carbon_offset_registries" to "authenticated";

grant insert on table "public"."carbon_offset_registries" to "authenticated";

grant references on table "public"."carbon_offset_registries" to "authenticated";

grant select on table "public"."carbon_offset_registries" to "authenticated";

grant trigger on table "public"."carbon_offset_registries" to "authenticated";

grant truncate on table "public"."carbon_offset_registries" to "authenticated";

grant update on table "public"."carbon_offset_registries" to "authenticated";

grant delete on table "public"."carbon_offset_registries" to "service_role";

grant insert on table "public"."carbon_offset_registries" to "service_role";

grant references on table "public"."carbon_offset_registries" to "service_role";

grant select on table "public"."carbon_offset_registries" to "service_role";

grant trigger on table "public"."carbon_offset_registries" to "service_role";

grant truncate on table "public"."carbon_offset_registries" to "service_role";

grant update on table "public"."carbon_offset_registries" to "service_role";

grant delete on table "public"."carbon_offsets" to "anon";

grant insert on table "public"."carbon_offsets" to "anon";

grant references on table "public"."carbon_offsets" to "anon";

grant select on table "public"."carbon_offsets" to "anon";

grant trigger on table "public"."carbon_offsets" to "anon";

grant truncate on table "public"."carbon_offsets" to "anon";

grant update on table "public"."carbon_offsets" to "anon";

grant delete on table "public"."carbon_offsets" to "authenticated";

grant insert on table "public"."carbon_offsets" to "authenticated";

grant references on table "public"."carbon_offsets" to "authenticated";

grant select on table "public"."carbon_offsets" to "authenticated";

grant trigger on table "public"."carbon_offsets" to "authenticated";

grant truncate on table "public"."carbon_offsets" to "authenticated";

grant update on table "public"."carbon_offsets" to "authenticated";

grant delete on table "public"."carbon_offsets" to "service_role";

grant insert on table "public"."carbon_offsets" to "service_role";

grant references on table "public"."carbon_offsets" to "service_role";

grant select on table "public"."carbon_offsets" to "service_role";

grant trigger on table "public"."carbon_offsets" to "service_role";

grant truncate on table "public"."carbon_offsets" to "service_role";

grant update on table "public"."carbon_offsets" to "service_role";

grant delete on table "public"."client_assets" to "anon";

grant insert on table "public"."client_assets" to "anon";

grant references on table "public"."client_assets" to "anon";

grant select on table "public"."client_assets" to "anon";

grant trigger on table "public"."client_assets" to "anon";

grant truncate on table "public"."client_assets" to "anon";

grant update on table "public"."client_assets" to "anon";

grant insert on table "public"."client_assets" to "authenticated";

grant select on table "public"."client_assets" to "authenticated";

grant update on table "public"."client_assets" to "authenticated";

grant delete on table "public"."client_assets" to "service_role";

grant insert on table "public"."client_assets" to "service_role";

grant references on table "public"."client_assets" to "service_role";

grant select on table "public"."client_assets" to "service_role";

grant trigger on table "public"."client_assets" to "service_role";

grant truncate on table "public"."client_assets" to "service_role";

grant update on table "public"."client_assets" to "service_role";

grant delete on table "public"."client_legal_entities" to "anon";

grant insert on table "public"."client_legal_entities" to "anon";

grant references on table "public"."client_legal_entities" to "anon";

grant select on table "public"."client_legal_entities" to "anon";

grant trigger on table "public"."client_legal_entities" to "anon";

grant truncate on table "public"."client_legal_entities" to "anon";

grant update on table "public"."client_legal_entities" to "anon";

grant insert on table "public"."client_legal_entities" to "authenticated";

grant select on table "public"."client_legal_entities" to "authenticated";

grant update on table "public"."client_legal_entities" to "authenticated";

grant delete on table "public"."client_legal_entities" to "service_role";

grant insert on table "public"."client_legal_entities" to "service_role";

grant references on table "public"."client_legal_entities" to "service_role";

grant select on table "public"."client_legal_entities" to "service_role";

grant trigger on table "public"."client_legal_entities" to "service_role";

grant truncate on table "public"."client_legal_entities" to "service_role";

grant update on table "public"."client_legal_entities" to "service_role";

grant delete on table "public"."client_organizations" to "anon";

grant insert on table "public"."client_organizations" to "anon";

grant references on table "public"."client_organizations" to "anon";

grant select on table "public"."client_organizations" to "anon";

grant trigger on table "public"."client_organizations" to "anon";

grant truncate on table "public"."client_organizations" to "anon";

grant update on table "public"."client_organizations" to "anon";

grant insert on table "public"."client_organizations" to "authenticated";

grant select on table "public"."client_organizations" to "authenticated";

grant update on table "public"."client_organizations" to "authenticated";

grant delete on table "public"."client_organizations" to "service_role";

grant insert on table "public"."client_organizations" to "service_role";

grant references on table "public"."client_organizations" to "service_role";

grant select on table "public"."client_organizations" to "service_role";

grant trigger on table "public"."client_organizations" to "service_role";

grant truncate on table "public"."client_organizations" to "service_role";

grant update on table "public"."client_organizations" to "service_role";

grant delete on table "public"."client_sites" to "anon";

grant insert on table "public"."client_sites" to "anon";

grant references on table "public"."client_sites" to "anon";

grant select on table "public"."client_sites" to "anon";

grant trigger on table "public"."client_sites" to "anon";

grant truncate on table "public"."client_sites" to "anon";

grant update on table "public"."client_sites" to "anon";

grant insert on table "public"."client_sites" to "authenticated";

grant select on table "public"."client_sites" to "authenticated";

grant update on table "public"."client_sites" to "authenticated";

grant delete on table "public"."client_sites" to "service_role";

grant insert on table "public"."client_sites" to "service_role";

grant references on table "public"."client_sites" to "service_role";

grant select on table "public"."client_sites" to "service_role";

grant trigger on table "public"."client_sites" to "service_role";

grant truncate on table "public"."client_sites" to "service_role";

grant update on table "public"."client_sites" to "service_role";

grant delete on table "public"."consent_records" to "anon";

grant insert on table "public"."consent_records" to "anon";

grant references on table "public"."consent_records" to "anon";

grant select on table "public"."consent_records" to "anon";

grant trigger on table "public"."consent_records" to "anon";

grant truncate on table "public"."consent_records" to "anon";

grant update on table "public"."consent_records" to "anon";

grant delete on table "public"."consent_records" to "authenticated";

grant insert on table "public"."consent_records" to "authenticated";

grant references on table "public"."consent_records" to "authenticated";

grant select on table "public"."consent_records" to "authenticated";

grant trigger on table "public"."consent_records" to "authenticated";

grant truncate on table "public"."consent_records" to "authenticated";

grant update on table "public"."consent_records" to "authenticated";

grant delete on table "public"."consent_records" to "service_role";

grant insert on table "public"."consent_records" to "service_role";

grant references on table "public"."consent_records" to "service_role";

grant select on table "public"."consent_records" to "service_role";

grant trigger on table "public"."consent_records" to "service_role";

grant truncate on table "public"."consent_records" to "service_role";

grant update on table "public"."consent_records" to "service_role";

grant delete on table "public"."consultants" to "anon";

grant insert on table "public"."consultants" to "anon";

grant references on table "public"."consultants" to "anon";

grant select on table "public"."consultants" to "anon";

grant trigger on table "public"."consultants" to "anon";

grant truncate on table "public"."consultants" to "anon";

grant update on table "public"."consultants" to "anon";

grant insert on table "public"."consultants" to "authenticated";

grant select on table "public"."consultants" to "authenticated";

grant update on table "public"."consultants" to "authenticated";

grant delete on table "public"."consultants" to "service_role";

grant insert on table "public"."consultants" to "service_role";

grant references on table "public"."consultants" to "service_role";

grant select on table "public"."consultants" to "service_role";

grant trigger on table "public"."consultants" to "service_role";

grant truncate on table "public"."consultants" to "service_role";

grant update on table "public"."consultants" to "service_role";

grant delete on table "public"."consumer_data_requests" to "anon";

grant insert on table "public"."consumer_data_requests" to "anon";

grant references on table "public"."consumer_data_requests" to "anon";

grant select on table "public"."consumer_data_requests" to "anon";

grant trigger on table "public"."consumer_data_requests" to "anon";

grant truncate on table "public"."consumer_data_requests" to "anon";

grant update on table "public"."consumer_data_requests" to "anon";

grant delete on table "public"."consumer_data_requests" to "authenticated";

grant insert on table "public"."consumer_data_requests" to "authenticated";

grant references on table "public"."consumer_data_requests" to "authenticated";

grant select on table "public"."consumer_data_requests" to "authenticated";

grant trigger on table "public"."consumer_data_requests" to "authenticated";

grant truncate on table "public"."consumer_data_requests" to "authenticated";

grant update on table "public"."consumer_data_requests" to "authenticated";

grant delete on table "public"."consumer_data_requests" to "service_role";

grant insert on table "public"."consumer_data_requests" to "service_role";

grant references on table "public"."consumer_data_requests" to "service_role";

grant select on table "public"."consumer_data_requests" to "service_role";

grant trigger on table "public"."consumer_data_requests" to "service_role";

grant truncate on table "public"."consumer_data_requests" to "service_role";

grant update on table "public"."consumer_data_requests" to "service_role";

grant delete on table "public"."data_portability_exports" to "anon";

grant insert on table "public"."data_portability_exports" to "anon";

grant references on table "public"."data_portability_exports" to "anon";

grant select on table "public"."data_portability_exports" to "anon";

grant trigger on table "public"."data_portability_exports" to "anon";

grant truncate on table "public"."data_portability_exports" to "anon";

grant update on table "public"."data_portability_exports" to "anon";

grant delete on table "public"."data_portability_exports" to "authenticated";

grant insert on table "public"."data_portability_exports" to "authenticated";

grant references on table "public"."data_portability_exports" to "authenticated";

grant select on table "public"."data_portability_exports" to "authenticated";

grant trigger on table "public"."data_portability_exports" to "authenticated";

grant truncate on table "public"."data_portability_exports" to "authenticated";

grant update on table "public"."data_portability_exports" to "authenticated";

grant delete on table "public"."data_portability_exports" to "service_role";

grant insert on table "public"."data_portability_exports" to "service_role";

grant references on table "public"."data_portability_exports" to "service_role";

grant select on table "public"."data_portability_exports" to "service_role";

grant trigger on table "public"."data_portability_exports" to "service_role";

grant truncate on table "public"."data_portability_exports" to "service_role";

grant update on table "public"."data_portability_exports" to "service_role";

grant delete on table "public"."data_quality_audit" to "anon";

grant insert on table "public"."data_quality_audit" to "anon";

grant references on table "public"."data_quality_audit" to "anon";

grant select on table "public"."data_quality_audit" to "anon";

grant trigger on table "public"."data_quality_audit" to "anon";

grant truncate on table "public"."data_quality_audit" to "anon";

grant update on table "public"."data_quality_audit" to "anon";

grant insert on table "public"."data_quality_audit" to "authenticated";

grant select on table "public"."data_quality_audit" to "authenticated";

grant update on table "public"."data_quality_audit" to "authenticated";

grant delete on table "public"."data_quality_audit" to "service_role";

grant insert on table "public"."data_quality_audit" to "service_role";

grant references on table "public"."data_quality_audit" to "service_role";

grant select on table "public"."data_quality_audit" to "service_role";

grant trigger on table "public"."data_quality_audit" to "service_role";

grant truncate on table "public"."data_quality_audit" to "service_role";

grant update on table "public"."data_quality_audit" to "service_role";

grant delete on table "public"."data_retention_policies" to "anon";

grant insert on table "public"."data_retention_policies" to "anon";

grant references on table "public"."data_retention_policies" to "anon";

grant select on table "public"."data_retention_policies" to "anon";

grant trigger on table "public"."data_retention_policies" to "anon";

grant truncate on table "public"."data_retention_policies" to "anon";

grant update on table "public"."data_retention_policies" to "anon";

grant delete on table "public"."data_retention_policies" to "authenticated";

grant insert on table "public"."data_retention_policies" to "authenticated";

grant references on table "public"."data_retention_policies" to "authenticated";

grant select on table "public"."data_retention_policies" to "authenticated";

grant trigger on table "public"."data_retention_policies" to "authenticated";

grant truncate on table "public"."data_retention_policies" to "authenticated";

grant update on table "public"."data_retention_policies" to "authenticated";

grant delete on table "public"."data_retention_policies" to "service_role";

grant insert on table "public"."data_retention_policies" to "service_role";

grant references on table "public"."data_retention_policies" to "service_role";

grant select on table "public"."data_retention_policies" to "service_role";

grant trigger on table "public"."data_retention_policies" to "service_role";

grant truncate on table "public"."data_retention_policies" to "service_role";

grant update on table "public"."data_retention_policies" to "service_role";

grant delete on table "public"."data_sale_opt_outs" to "anon";

grant insert on table "public"."data_sale_opt_outs" to "anon";

grant references on table "public"."data_sale_opt_outs" to "anon";

grant select on table "public"."data_sale_opt_outs" to "anon";

grant trigger on table "public"."data_sale_opt_outs" to "anon";

grant truncate on table "public"."data_sale_opt_outs" to "anon";

grant update on table "public"."data_sale_opt_outs" to "anon";

grant delete on table "public"."data_sale_opt_outs" to "authenticated";

grant insert on table "public"."data_sale_opt_outs" to "authenticated";

grant references on table "public"."data_sale_opt_outs" to "authenticated";

grant select on table "public"."data_sale_opt_outs" to "authenticated";

grant trigger on table "public"."data_sale_opt_outs" to "authenticated";

grant truncate on table "public"."data_sale_opt_outs" to "authenticated";

grant update on table "public"."data_sale_opt_outs" to "authenticated";

grant delete on table "public"."data_sale_opt_outs" to "service_role";

grant insert on table "public"."data_sale_opt_outs" to "service_role";

grant references on table "public"."data_sale_opt_outs" to "service_role";

grant select on table "public"."data_sale_opt_outs" to "service_role";

grant trigger on table "public"."data_sale_opt_outs" to "service_role";

grant truncate on table "public"."data_sale_opt_outs" to "service_role";

grant update on table "public"."data_sale_opt_outs" to "service_role";

grant delete on table "public"."data_subject_access_requests" to "anon";

grant insert on table "public"."data_subject_access_requests" to "anon";

grant references on table "public"."data_subject_access_requests" to "anon";

grant select on table "public"."data_subject_access_requests" to "anon";

grant trigger on table "public"."data_subject_access_requests" to "anon";

grant truncate on table "public"."data_subject_access_requests" to "anon";

grant update on table "public"."data_subject_access_requests" to "anon";

grant delete on table "public"."data_subject_access_requests" to "authenticated";

grant insert on table "public"."data_subject_access_requests" to "authenticated";

grant references on table "public"."data_subject_access_requests" to "authenticated";

grant select on table "public"."data_subject_access_requests" to "authenticated";

grant trigger on table "public"."data_subject_access_requests" to "authenticated";

grant truncate on table "public"."data_subject_access_requests" to "authenticated";

grant update on table "public"."data_subject_access_requests" to "authenticated";

grant delete on table "public"."data_subject_access_requests" to "service_role";

grant insert on table "public"."data_subject_access_requests" to "service_role";

grant references on table "public"."data_subject_access_requests" to "service_role";

grant select on table "public"."data_subject_access_requests" to "service_role";

grant trigger on table "public"."data_subject_access_requests" to "service_role";

grant truncate on table "public"."data_subject_access_requests" to "service_role";

grant update on table "public"."data_subject_access_requests" to "service_role";

grant delete on table "public"."disclosure_frameworks" to "anon";

grant insert on table "public"."disclosure_frameworks" to "anon";

grant references on table "public"."disclosure_frameworks" to "anon";

grant select on table "public"."disclosure_frameworks" to "anon";

grant trigger on table "public"."disclosure_frameworks" to "anon";

grant truncate on table "public"."disclosure_frameworks" to "anon";

grant update on table "public"."disclosure_frameworks" to "anon";

grant delete on table "public"."disclosure_frameworks" to "authenticated";

grant insert on table "public"."disclosure_frameworks" to "authenticated";

grant references on table "public"."disclosure_frameworks" to "authenticated";

grant select on table "public"."disclosure_frameworks" to "authenticated";

grant trigger on table "public"."disclosure_frameworks" to "authenticated";

grant truncate on table "public"."disclosure_frameworks" to "authenticated";

grant update on table "public"."disclosure_frameworks" to "authenticated";

grant delete on table "public"."disclosure_frameworks" to "service_role";

grant insert on table "public"."disclosure_frameworks" to "service_role";

grant references on table "public"."disclosure_frameworks" to "service_role";

grant select on table "public"."disclosure_frameworks" to "service_role";

grant trigger on table "public"."disclosure_frameworks" to "service_role";

grant truncate on table "public"."disclosure_frameworks" to "service_role";

grant update on table "public"."disclosure_frameworks" to "service_role";

grant delete on table "public"."dpdp_erasure_requests" to "anon";

grant insert on table "public"."dpdp_erasure_requests" to "anon";

grant references on table "public"."dpdp_erasure_requests" to "anon";

grant select on table "public"."dpdp_erasure_requests" to "anon";

grant trigger on table "public"."dpdp_erasure_requests" to "anon";

grant truncate on table "public"."dpdp_erasure_requests" to "anon";

grant update on table "public"."dpdp_erasure_requests" to "anon";

grant delete on table "public"."dpdp_erasure_requests" to "authenticated";

grant insert on table "public"."dpdp_erasure_requests" to "authenticated";

grant references on table "public"."dpdp_erasure_requests" to "authenticated";

grant select on table "public"."dpdp_erasure_requests" to "authenticated";

grant trigger on table "public"."dpdp_erasure_requests" to "authenticated";

grant truncate on table "public"."dpdp_erasure_requests" to "authenticated";

grant update on table "public"."dpdp_erasure_requests" to "authenticated";

grant delete on table "public"."dpdp_erasure_requests" to "service_role";

grant insert on table "public"."dpdp_erasure_requests" to "service_role";

grant references on table "public"."dpdp_erasure_requests" to "service_role";

grant select on table "public"."dpdp_erasure_requests" to "service_role";

grant trigger on table "public"."dpdp_erasure_requests" to "service_role";

grant truncate on table "public"."dpdp_erasure_requests" to "service_role";

grant update on table "public"."dpdp_erasure_requests" to "service_role";

grant delete on table "public"."emission_factor_versions" to "anon";

grant insert on table "public"."emission_factor_versions" to "anon";

grant references on table "public"."emission_factor_versions" to "anon";

grant select on table "public"."emission_factor_versions" to "anon";

grant trigger on table "public"."emission_factor_versions" to "anon";

grant truncate on table "public"."emission_factor_versions" to "anon";

grant update on table "public"."emission_factor_versions" to "anon";

grant select on table "public"."emission_factor_versions" to "authenticated";

grant delete on table "public"."emission_factor_versions" to "service_role";

grant insert on table "public"."emission_factor_versions" to "service_role";

grant references on table "public"."emission_factor_versions" to "service_role";

grant select on table "public"."emission_factor_versions" to "service_role";

grant trigger on table "public"."emission_factor_versions" to "service_role";

grant truncate on table "public"."emission_factor_versions" to "service_role";

grant update on table "public"."emission_factor_versions" to "service_role";

grant delete on table "public"."erp_connection_vault" to "anon";

grant insert on table "public"."erp_connection_vault" to "anon";

grant references on table "public"."erp_connection_vault" to "anon";

grant select on table "public"."erp_connection_vault" to "anon";

grant trigger on table "public"."erp_connection_vault" to "anon";

grant truncate on table "public"."erp_connection_vault" to "anon";

grant update on table "public"."erp_connection_vault" to "anon";

grant delete on table "public"."erp_connection_vault" to "authenticated";

grant insert on table "public"."erp_connection_vault" to "authenticated";

grant references on table "public"."erp_connection_vault" to "authenticated";

grant select on table "public"."erp_connection_vault" to "authenticated";

grant trigger on table "public"."erp_connection_vault" to "authenticated";

grant truncate on table "public"."erp_connection_vault" to "authenticated";

grant update on table "public"."erp_connection_vault" to "authenticated";

grant delete on table "public"."erp_connection_vault" to "service_role";

grant insert on table "public"."erp_connection_vault" to "service_role";

grant references on table "public"."erp_connection_vault" to "service_role";

grant select on table "public"."erp_connection_vault" to "service_role";

grant trigger on table "public"."erp_connection_vault" to "service_role";

grant truncate on table "public"."erp_connection_vault" to "service_role";

grant update on table "public"."erp_connection_vault" to "service_role";

grant delete on table "public"."erp_field_mappings" to "anon";

grant insert on table "public"."erp_field_mappings" to "anon";

grant references on table "public"."erp_field_mappings" to "anon";

grant select on table "public"."erp_field_mappings" to "anon";

grant trigger on table "public"."erp_field_mappings" to "anon";

grant truncate on table "public"."erp_field_mappings" to "anon";

grant update on table "public"."erp_field_mappings" to "anon";

grant insert on table "public"."erp_field_mappings" to "authenticated";

grant select on table "public"."erp_field_mappings" to "authenticated";

grant update on table "public"."erp_field_mappings" to "authenticated";

grant delete on table "public"."erp_field_mappings" to "service_role";

grant insert on table "public"."erp_field_mappings" to "service_role";

grant references on table "public"."erp_field_mappings" to "service_role";

grant select on table "public"."erp_field_mappings" to "service_role";

grant trigger on table "public"."erp_field_mappings" to "service_role";

grant truncate on table "public"."erp_field_mappings" to "service_role";

grant update on table "public"."erp_field_mappings" to "service_role";

grant delete on table "public"."erp_sync_logs" to "anon";

grant insert on table "public"."erp_sync_logs" to "anon";

grant references on table "public"."erp_sync_logs" to "anon";

grant select on table "public"."erp_sync_logs" to "anon";

grant trigger on table "public"."erp_sync_logs" to "anon";

grant truncate on table "public"."erp_sync_logs" to "anon";

grant update on table "public"."erp_sync_logs" to "anon";

grant insert on table "public"."erp_sync_logs" to "authenticated";

grant select on table "public"."erp_sync_logs" to "authenticated";

grant update on table "public"."erp_sync_logs" to "authenticated";

grant delete on table "public"."erp_sync_logs" to "service_role";

grant insert on table "public"."erp_sync_logs" to "service_role";

grant references on table "public"."erp_sync_logs" to "service_role";

grant select on table "public"."erp_sync_logs" to "service_role";

grant trigger on table "public"."erp_sync_logs" to "service_role";

grant truncate on table "public"."erp_sync_logs" to "service_role";

grant update on table "public"."erp_sync_logs" to "service_role";

grant delete on table "public"."erp_systems" to "anon";

grant insert on table "public"."erp_systems" to "anon";

grant references on table "public"."erp_systems" to "anon";

grant select on table "public"."erp_systems" to "anon";

grant trigger on table "public"."erp_systems" to "anon";

grant truncate on table "public"."erp_systems" to "anon";

grant update on table "public"."erp_systems" to "anon";

grant insert on table "public"."erp_systems" to "authenticated";

grant select on table "public"."erp_systems" to "authenticated";

grant update on table "public"."erp_systems" to "authenticated";

grant delete on table "public"."erp_systems" to "service_role";

grant insert on table "public"."erp_systems" to "service_role";

grant references on table "public"."erp_systems" to "service_role";

grant select on table "public"."erp_systems" to "service_role";

grant trigger on table "public"."erp_systems" to "service_role";

grant truncate on table "public"."erp_systems" to "service_role";

grant update on table "public"."erp_systems" to "service_role";

grant delete on table "public"."feature_flags" to "anon";

grant insert on table "public"."feature_flags" to "anon";

grant references on table "public"."feature_flags" to "anon";

grant select on table "public"."feature_flags" to "anon";

grant trigger on table "public"."feature_flags" to "anon";

grant truncate on table "public"."feature_flags" to "anon";

grant update on table "public"."feature_flags" to "anon";

grant delete on table "public"."feature_flags" to "authenticated";

grant insert on table "public"."feature_flags" to "authenticated";

grant references on table "public"."feature_flags" to "authenticated";

grant select on table "public"."feature_flags" to "authenticated";

grant trigger on table "public"."feature_flags" to "authenticated";

grant truncate on table "public"."feature_flags" to "authenticated";

grant update on table "public"."feature_flags" to "authenticated";

grant delete on table "public"."feature_flags" to "service_role";

grant insert on table "public"."feature_flags" to "service_role";

grant references on table "public"."feature_flags" to "service_role";

grant select on table "public"."feature_flags" to "service_role";

grant trigger on table "public"."feature_flags" to "service_role";

grant truncate on table "public"."feature_flags" to "service_role";

grant update on table "public"."feature_flags" to "service_role";

grant delete on table "public"."fleet_monthly_logs" to "anon";

grant insert on table "public"."fleet_monthly_logs" to "anon";

grant references on table "public"."fleet_monthly_logs" to "anon";

grant select on table "public"."fleet_monthly_logs" to "anon";

grant trigger on table "public"."fleet_monthly_logs" to "anon";

grant truncate on table "public"."fleet_monthly_logs" to "anon";

grant update on table "public"."fleet_monthly_logs" to "anon";

grant insert on table "public"."fleet_monthly_logs" to "authenticated";

grant select on table "public"."fleet_monthly_logs" to "authenticated";

grant update on table "public"."fleet_monthly_logs" to "authenticated";

grant delete on table "public"."fleet_monthly_logs" to "service_role";

grant insert on table "public"."fleet_monthly_logs" to "service_role";

grant references on table "public"."fleet_monthly_logs" to "service_role";

grant select on table "public"."fleet_monthly_logs" to "service_role";

grant trigger on table "public"."fleet_monthly_logs" to "service_role";

grant truncate on table "public"."fleet_monthly_logs" to "service_role";

grant update on table "public"."fleet_monthly_logs" to "service_role";

grant delete on table "public"."fleet_vehicles" to "anon";

grant insert on table "public"."fleet_vehicles" to "anon";

grant references on table "public"."fleet_vehicles" to "anon";

grant select on table "public"."fleet_vehicles" to "anon";

grant trigger on table "public"."fleet_vehicles" to "anon";

grant truncate on table "public"."fleet_vehicles" to "anon";

grant update on table "public"."fleet_vehicles" to "anon";

grant insert on table "public"."fleet_vehicles" to "authenticated";

grant select on table "public"."fleet_vehicles" to "authenticated";

grant update on table "public"."fleet_vehicles" to "authenticated";

grant delete on table "public"."fleet_vehicles" to "service_role";

grant insert on table "public"."fleet_vehicles" to "service_role";

grant references on table "public"."fleet_vehicles" to "service_role";

grant select on table "public"."fleet_vehicles" to "service_role";

grant trigger on table "public"."fleet_vehicles" to "service_role";

grant truncate on table "public"."fleet_vehicles" to "service_role";

grant update on table "public"."fleet_vehicles" to "service_role";

grant delete on table "public"."framework_disclosures" to "anon";

grant insert on table "public"."framework_disclosures" to "anon";

grant references on table "public"."framework_disclosures" to "anon";

grant select on table "public"."framework_disclosures" to "anon";

grant trigger on table "public"."framework_disclosures" to "anon";

grant truncate on table "public"."framework_disclosures" to "anon";

grant update on table "public"."framework_disclosures" to "anon";

grant delete on table "public"."framework_disclosures" to "authenticated";

grant insert on table "public"."framework_disclosures" to "authenticated";

grant references on table "public"."framework_disclosures" to "authenticated";

grant select on table "public"."framework_disclosures" to "authenticated";

grant trigger on table "public"."framework_disclosures" to "authenticated";

grant truncate on table "public"."framework_disclosures" to "authenticated";

grant update on table "public"."framework_disclosures" to "authenticated";

grant delete on table "public"."framework_disclosures" to "service_role";

grant insert on table "public"."framework_disclosures" to "service_role";

grant references on table "public"."framework_disclosures" to "service_role";

grant select on table "public"."framework_disclosures" to "service_role";

grant trigger on table "public"."framework_disclosures" to "service_role";

grant truncate on table "public"."framework_disclosures" to "service_role";

grant update on table "public"."framework_disclosures" to "service_role";

grant delete on table "public"."framework_indicators" to "anon";

grant insert on table "public"."framework_indicators" to "anon";

grant references on table "public"."framework_indicators" to "anon";

grant select on table "public"."framework_indicators" to "anon";

grant trigger on table "public"."framework_indicators" to "anon";

grant truncate on table "public"."framework_indicators" to "anon";

grant update on table "public"."framework_indicators" to "anon";

grant delete on table "public"."framework_indicators" to "authenticated";

grant insert on table "public"."framework_indicators" to "authenticated";

grant references on table "public"."framework_indicators" to "authenticated";

grant select on table "public"."framework_indicators" to "authenticated";

grant trigger on table "public"."framework_indicators" to "authenticated";

grant truncate on table "public"."framework_indicators" to "authenticated";

grant update on table "public"."framework_indicators" to "authenticated";

grant delete on table "public"."framework_indicators" to "service_role";

grant insert on table "public"."framework_indicators" to "service_role";

grant references on table "public"."framework_indicators" to "service_role";

grant select on table "public"."framework_indicators" to "service_role";

grant trigger on table "public"."framework_indicators" to "service_role";

grant truncate on table "public"."framework_indicators" to "service_role";

grant update on table "public"."framework_indicators" to "service_role";

grant delete on table "public"."ghg_anomaly_flags" to "anon";

grant insert on table "public"."ghg_anomaly_flags" to "anon";

grant references on table "public"."ghg_anomaly_flags" to "anon";

grant select on table "public"."ghg_anomaly_flags" to "anon";

grant trigger on table "public"."ghg_anomaly_flags" to "anon";

grant truncate on table "public"."ghg_anomaly_flags" to "anon";

grant update on table "public"."ghg_anomaly_flags" to "anon";

grant insert on table "public"."ghg_anomaly_flags" to "authenticated";

grant select on table "public"."ghg_anomaly_flags" to "authenticated";

grant update on table "public"."ghg_anomaly_flags" to "authenticated";

grant delete on table "public"."ghg_anomaly_flags" to "service_role";

grant insert on table "public"."ghg_anomaly_flags" to "service_role";

grant references on table "public"."ghg_anomaly_flags" to "service_role";

grant select on table "public"."ghg_anomaly_flags" to "service_role";

grant trigger on table "public"."ghg_anomaly_flags" to "service_role";

grant truncate on table "public"."ghg_anomaly_flags" to "service_role";

grant update on table "public"."ghg_anomaly_flags" to "service_role";

grant delete on table "public"."ghg_base_year_recalculations" to "anon";

grant insert on table "public"."ghg_base_year_recalculations" to "anon";

grant references on table "public"."ghg_base_year_recalculations" to "anon";

grant select on table "public"."ghg_base_year_recalculations" to "anon";

grant trigger on table "public"."ghg_base_year_recalculations" to "anon";

grant truncate on table "public"."ghg_base_year_recalculations" to "anon";

grant update on table "public"."ghg_base_year_recalculations" to "anon";

grant insert on table "public"."ghg_base_year_recalculations" to "authenticated";

grant select on table "public"."ghg_base_year_recalculations" to "authenticated";

grant update on table "public"."ghg_base_year_recalculations" to "authenticated";

grant delete on table "public"."ghg_base_year_recalculations" to "service_role";

grant insert on table "public"."ghg_base_year_recalculations" to "service_role";

grant references on table "public"."ghg_base_year_recalculations" to "service_role";

grant select on table "public"."ghg_base_year_recalculations" to "service_role";

grant trigger on table "public"."ghg_base_year_recalculations" to "service_role";

grant truncate on table "public"."ghg_base_year_recalculations" to "service_role";

grant update on table "public"."ghg_base_year_recalculations" to "service_role";

grant delete on table "public"."ghg_base_years" to "anon";

grant insert on table "public"."ghg_base_years" to "anon";

grant references on table "public"."ghg_base_years" to "anon";

grant select on table "public"."ghg_base_years" to "anon";

grant trigger on table "public"."ghg_base_years" to "anon";

grant truncate on table "public"."ghg_base_years" to "anon";

grant update on table "public"."ghg_base_years" to "anon";

grant insert on table "public"."ghg_base_years" to "authenticated";

grant select on table "public"."ghg_base_years" to "authenticated";

grant update on table "public"."ghg_base_years" to "authenticated";

grant delete on table "public"."ghg_base_years" to "service_role";

grant insert on table "public"."ghg_base_years" to "service_role";

grant references on table "public"."ghg_base_years" to "service_role";

grant select on table "public"."ghg_base_years" to "service_role";

grant trigger on table "public"."ghg_base_years" to "service_role";

grant truncate on table "public"."ghg_base_years" to "service_role";

grant update on table "public"."ghg_base_years" to "service_role";

grant delete on table "public"."ghg_calculation_methodologies" to "anon";

grant insert on table "public"."ghg_calculation_methodologies" to "anon";

grant references on table "public"."ghg_calculation_methodologies" to "anon";

grant select on table "public"."ghg_calculation_methodologies" to "anon";

grant trigger on table "public"."ghg_calculation_methodologies" to "anon";

grant truncate on table "public"."ghg_calculation_methodologies" to "anon";

grant update on table "public"."ghg_calculation_methodologies" to "anon";

grant select on table "public"."ghg_calculation_methodologies" to "authenticated";

grant delete on table "public"."ghg_calculation_methodologies" to "service_role";

grant insert on table "public"."ghg_calculation_methodologies" to "service_role";

grant references on table "public"."ghg_calculation_methodologies" to "service_role";

grant select on table "public"."ghg_calculation_methodologies" to "service_role";

grant trigger on table "public"."ghg_calculation_methodologies" to "service_role";

grant truncate on table "public"."ghg_calculation_methodologies" to "service_role";

grant update on table "public"."ghg_calculation_methodologies" to "service_role";

grant delete on table "public"."ghg_corrective_actions" to "anon";

grant insert on table "public"."ghg_corrective_actions" to "anon";

grant references on table "public"."ghg_corrective_actions" to "anon";

grant select on table "public"."ghg_corrective_actions" to "anon";

grant trigger on table "public"."ghg_corrective_actions" to "anon";

grant truncate on table "public"."ghg_corrective_actions" to "anon";

grant update on table "public"."ghg_corrective_actions" to "anon";

grant insert on table "public"."ghg_corrective_actions" to "authenticated";

grant select on table "public"."ghg_corrective_actions" to "authenticated";

grant update on table "public"."ghg_corrective_actions" to "authenticated";

grant delete on table "public"."ghg_corrective_actions" to "service_role";

grant insert on table "public"."ghg_corrective_actions" to "service_role";

grant references on table "public"."ghg_corrective_actions" to "service_role";

grant select on table "public"."ghg_corrective_actions" to "service_role";

grant trigger on table "public"."ghg_corrective_actions" to "service_role";

grant truncate on table "public"."ghg_corrective_actions" to "service_role";

grant update on table "public"."ghg_corrective_actions" to "service_role";

grant delete on table "public"."ghg_data_quality_assessments" to "anon";

grant insert on table "public"."ghg_data_quality_assessments" to "anon";

grant references on table "public"."ghg_data_quality_assessments" to "anon";

grant select on table "public"."ghg_data_quality_assessments" to "anon";

grant trigger on table "public"."ghg_data_quality_assessments" to "anon";

grant truncate on table "public"."ghg_data_quality_assessments" to "anon";

grant update on table "public"."ghg_data_quality_assessments" to "anon";

grant insert on table "public"."ghg_data_quality_assessments" to "authenticated";

grant select on table "public"."ghg_data_quality_assessments" to "authenticated";

grant update on table "public"."ghg_data_quality_assessments" to "authenticated";

grant delete on table "public"."ghg_data_quality_assessments" to "service_role";

grant insert on table "public"."ghg_data_quality_assessments" to "service_role";

grant references on table "public"."ghg_data_quality_assessments" to "service_role";

grant select on table "public"."ghg_data_quality_assessments" to "service_role";

grant trigger on table "public"."ghg_data_quality_assessments" to "service_role";

grant truncate on table "public"."ghg_data_quality_assessments" to "service_role";

grant update on table "public"."ghg_data_quality_assessments" to "service_role";

grant delete on table "public"."ghg_documents" to "anon";

grant insert on table "public"."ghg_documents" to "anon";

grant references on table "public"."ghg_documents" to "anon";

grant select on table "public"."ghg_documents" to "anon";

grant trigger on table "public"."ghg_documents" to "anon";

grant truncate on table "public"."ghg_documents" to "anon";

grant update on table "public"."ghg_documents" to "anon";

grant insert on table "public"."ghg_documents" to "authenticated";

grant select on table "public"."ghg_documents" to "authenticated";

grant update on table "public"."ghg_documents" to "authenticated";

grant delete on table "public"."ghg_documents" to "service_role";

grant insert on table "public"."ghg_documents" to "service_role";

grant references on table "public"."ghg_documents" to "service_role";

grant select on table "public"."ghg_documents" to "service_role";

grant trigger on table "public"."ghg_documents" to "service_role";

grant truncate on table "public"."ghg_documents" to "service_role";

grant update on table "public"."ghg_documents" to "service_role";

grant delete on table "public"."ghg_emission_source_register" to "anon";

grant insert on table "public"."ghg_emission_source_register" to "anon";

grant references on table "public"."ghg_emission_source_register" to "anon";

grant select on table "public"."ghg_emission_source_register" to "anon";

grant trigger on table "public"."ghg_emission_source_register" to "anon";

grant truncate on table "public"."ghg_emission_source_register" to "anon";

grant update on table "public"."ghg_emission_source_register" to "anon";

grant insert on table "public"."ghg_emission_source_register" to "authenticated";

grant select on table "public"."ghg_emission_source_register" to "authenticated";

grant update on table "public"."ghg_emission_source_register" to "authenticated";

grant delete on table "public"."ghg_emission_source_register" to "service_role";

grant insert on table "public"."ghg_emission_source_register" to "service_role";

grant references on table "public"."ghg_emission_source_register" to "service_role";

grant select on table "public"."ghg_emission_source_register" to "service_role";

grant trigger on table "public"."ghg_emission_source_register" to "service_role";

grant truncate on table "public"."ghg_emission_source_register" to "service_role";

grant update on table "public"."ghg_emission_source_register" to "service_role";

grant delete on table "public"."ghg_exclusion_register" to "anon";

grant insert on table "public"."ghg_exclusion_register" to "anon";

grant references on table "public"."ghg_exclusion_register" to "anon";

grant select on table "public"."ghg_exclusion_register" to "anon";

grant trigger on table "public"."ghg_exclusion_register" to "anon";

grant truncate on table "public"."ghg_exclusion_register" to "anon";

grant update on table "public"."ghg_exclusion_register" to "anon";

grant delete on table "public"."ghg_exclusion_register" to "service_role";

grant insert on table "public"."ghg_exclusion_register" to "service_role";

grant references on table "public"."ghg_exclusion_register" to "service_role";

grant select on table "public"."ghg_exclusion_register" to "service_role";

grant trigger on table "public"."ghg_exclusion_register" to "service_role";

grant truncate on table "public"."ghg_exclusion_register" to "service_role";

grant update on table "public"."ghg_exclusion_register" to "service_role";

grant delete on table "public"."ghg_hazardous_consumables" to "anon";

grant insert on table "public"."ghg_hazardous_consumables" to "anon";

grant references on table "public"."ghg_hazardous_consumables" to "anon";

grant select on table "public"."ghg_hazardous_consumables" to "anon";

grant trigger on table "public"."ghg_hazardous_consumables" to "anon";

grant truncate on table "public"."ghg_hazardous_consumables" to "anon";

grant update on table "public"."ghg_hazardous_consumables" to "anon";

grant insert on table "public"."ghg_hazardous_consumables" to "authenticated";

grant select on table "public"."ghg_hazardous_consumables" to "authenticated";

grant update on table "public"."ghg_hazardous_consumables" to "authenticated";

grant delete on table "public"."ghg_hazardous_consumables" to "service_role";

grant insert on table "public"."ghg_hazardous_consumables" to "service_role";

grant references on table "public"."ghg_hazardous_consumables" to "service_role";

grant select on table "public"."ghg_hazardous_consumables" to "service_role";

grant trigger on table "public"."ghg_hazardous_consumables" to "service_role";

grant truncate on table "public"."ghg_hazardous_consumables" to "service_role";

grant update on table "public"."ghg_hazardous_consumables" to "service_role";

grant delete on table "public"."ghg_industry_segments" to "anon";

grant insert on table "public"."ghg_industry_segments" to "anon";

grant references on table "public"."ghg_industry_segments" to "anon";

grant select on table "public"."ghg_industry_segments" to "anon";

grant trigger on table "public"."ghg_industry_segments" to "anon";

grant truncate on table "public"."ghg_industry_segments" to "anon";

grant update on table "public"."ghg_industry_segments" to "anon";

grant select on table "public"."ghg_industry_segments" to "authenticated";

grant delete on table "public"."ghg_industry_segments" to "service_role";

grant insert on table "public"."ghg_industry_segments" to "service_role";

grant references on table "public"."ghg_industry_segments" to "service_role";

grant select on table "public"."ghg_industry_segments" to "service_role";

grant trigger on table "public"."ghg_industry_segments" to "service_role";

grant truncate on table "public"."ghg_industry_segments" to "service_role";

grant update on table "public"."ghg_industry_segments" to "service_role";

grant delete on table "public"."ghg_intensity_metrics" to "anon";

grant insert on table "public"."ghg_intensity_metrics" to "anon";

grant references on table "public"."ghg_intensity_metrics" to "anon";

grant select on table "public"."ghg_intensity_metrics" to "anon";

grant trigger on table "public"."ghg_intensity_metrics" to "anon";

grant truncate on table "public"."ghg_intensity_metrics" to "anon";

grant update on table "public"."ghg_intensity_metrics" to "anon";

grant insert on table "public"."ghg_intensity_metrics" to "authenticated";

grant select on table "public"."ghg_intensity_metrics" to "authenticated";

grant update on table "public"."ghg_intensity_metrics" to "authenticated";

grant delete on table "public"."ghg_intensity_metrics" to "service_role";

grant insert on table "public"."ghg_intensity_metrics" to "service_role";

grant references on table "public"."ghg_intensity_metrics" to "service_role";

grant select on table "public"."ghg_intensity_metrics" to "service_role";

grant trigger on table "public"."ghg_intensity_metrics" to "service_role";

grant truncate on table "public"."ghg_intensity_metrics" to "service_role";

grant update on table "public"."ghg_intensity_metrics" to "service_role";

grant delete on table "public"."ghg_internal_audits" to "anon";

grant insert on table "public"."ghg_internal_audits" to "anon";

grant references on table "public"."ghg_internal_audits" to "anon";

grant select on table "public"."ghg_internal_audits" to "anon";

grant trigger on table "public"."ghg_internal_audits" to "anon";

grant truncate on table "public"."ghg_internal_audits" to "anon";

grant update on table "public"."ghg_internal_audits" to "anon";

grant insert on table "public"."ghg_internal_audits" to "authenticated";

grant select on table "public"."ghg_internal_audits" to "authenticated";

grant update on table "public"."ghg_internal_audits" to "authenticated";

grant delete on table "public"."ghg_internal_audits" to "service_role";

grant insert on table "public"."ghg_internal_audits" to "service_role";

grant references on table "public"."ghg_internal_audits" to "service_role";

grant select on table "public"."ghg_internal_audits" to "service_role";

grant trigger on table "public"."ghg_internal_audits" to "service_role";

grant truncate on table "public"."ghg_internal_audits" to "service_role";

grant update on table "public"."ghg_internal_audits" to "service_role";

grant delete on table "public"."ghg_management_reviews" to "anon";

grant insert on table "public"."ghg_management_reviews" to "anon";

grant references on table "public"."ghg_management_reviews" to "anon";

grant select on table "public"."ghg_management_reviews" to "anon";

grant trigger on table "public"."ghg_management_reviews" to "anon";

grant truncate on table "public"."ghg_management_reviews" to "anon";

grant update on table "public"."ghg_management_reviews" to "anon";

grant insert on table "public"."ghg_management_reviews" to "authenticated";

grant select on table "public"."ghg_management_reviews" to "authenticated";

grant update on table "public"."ghg_management_reviews" to "authenticated";

grant delete on table "public"."ghg_management_reviews" to "service_role";

grant insert on table "public"."ghg_management_reviews" to "service_role";

grant references on table "public"."ghg_management_reviews" to "service_role";

grant select on table "public"."ghg_management_reviews" to "service_role";

grant trigger on table "public"."ghg_management_reviews" to "service_role";

grant truncate on table "public"."ghg_management_reviews" to "service_role";

grant update on table "public"."ghg_management_reviews" to "service_role";

grant delete on table "public"."ghg_ml_features" to "anon";

grant insert on table "public"."ghg_ml_features" to "anon";

grant references on table "public"."ghg_ml_features" to "anon";

grant select on table "public"."ghg_ml_features" to "anon";

grant trigger on table "public"."ghg_ml_features" to "anon";

grant truncate on table "public"."ghg_ml_features" to "anon";

grant update on table "public"."ghg_ml_features" to "anon";

grant insert on table "public"."ghg_ml_features" to "authenticated";

grant select on table "public"."ghg_ml_features" to "authenticated";

grant update on table "public"."ghg_ml_features" to "authenticated";

grant delete on table "public"."ghg_ml_features" to "service_role";

grant insert on table "public"."ghg_ml_features" to "service_role";

grant references on table "public"."ghg_ml_features" to "service_role";

grant select on table "public"."ghg_ml_features" to "service_role";

grant trigger on table "public"."ghg_ml_features" to "service_role";

grant truncate on table "public"."ghg_ml_features" to "service_role";

grant update on table "public"."ghg_ml_features" to "service_role";

grant delete on table "public"."ghg_monthly_readings" to "anon";

grant insert on table "public"."ghg_monthly_readings" to "anon";

grant references on table "public"."ghg_monthly_readings" to "anon";

grant select on table "public"."ghg_monthly_readings" to "anon";

grant trigger on table "public"."ghg_monthly_readings" to "anon";

grant truncate on table "public"."ghg_monthly_readings" to "anon";

grant update on table "public"."ghg_monthly_readings" to "anon";

grant insert on table "public"."ghg_monthly_readings" to "authenticated";

grant select on table "public"."ghg_monthly_readings" to "authenticated";

grant update on table "public"."ghg_monthly_readings" to "authenticated";

grant delete on table "public"."ghg_monthly_readings" to "service_role";

grant insert on table "public"."ghg_monthly_readings" to "service_role";

grant references on table "public"."ghg_monthly_readings" to "service_role";

grant select on table "public"."ghg_monthly_readings" to "service_role";

grant trigger on table "public"."ghg_monthly_readings" to "service_role";

grant truncate on table "public"."ghg_monthly_readings" to "service_role";

grant update on table "public"."ghg_monthly_readings" to "service_role";

grant delete on table "public"."ghg_notifications" to "anon";

grant insert on table "public"."ghg_notifications" to "anon";

grant references on table "public"."ghg_notifications" to "anon";

grant select on table "public"."ghg_notifications" to "anon";

grant trigger on table "public"."ghg_notifications" to "anon";

grant truncate on table "public"."ghg_notifications" to "anon";

grant update on table "public"."ghg_notifications" to "anon";

grant insert on table "public"."ghg_notifications" to "authenticated";

grant select on table "public"."ghg_notifications" to "authenticated";

grant update on table "public"."ghg_notifications" to "authenticated";

grant delete on table "public"."ghg_notifications" to "service_role";

grant insert on table "public"."ghg_notifications" to "service_role";

grant references on table "public"."ghg_notifications" to "service_role";

grant select on table "public"."ghg_notifications" to "service_role";

grant trigger on table "public"."ghg_notifications" to "service_role";

grant truncate on table "public"."ghg_notifications" to "service_role";

grant update on table "public"."ghg_notifications" to "service_role";

grant delete on table "public"."ghg_reading_amendments" to "anon";

grant insert on table "public"."ghg_reading_amendments" to "anon";

grant references on table "public"."ghg_reading_amendments" to "anon";

grant select on table "public"."ghg_reading_amendments" to "anon";

grant trigger on table "public"."ghg_reading_amendments" to "anon";

grant truncate on table "public"."ghg_reading_amendments" to "anon";

grant update on table "public"."ghg_reading_amendments" to "anon";

grant insert on table "public"."ghg_reading_amendments" to "authenticated";

grant select on table "public"."ghg_reading_amendments" to "authenticated";

grant update on table "public"."ghg_reading_amendments" to "authenticated";

grant delete on table "public"."ghg_reading_amendments" to "service_role";

grant insert on table "public"."ghg_reading_amendments" to "service_role";

grant references on table "public"."ghg_reading_amendments" to "service_role";

grant select on table "public"."ghg_reading_amendments" to "service_role";

grant trigger on table "public"."ghg_reading_amendments" to "service_role";

grant truncate on table "public"."ghg_reading_amendments" to "service_role";

grant update on table "public"."ghg_reading_amendments" to "service_role";

grant delete on table "public"."ghg_reporting_boundaries" to "anon";

grant insert on table "public"."ghg_reporting_boundaries" to "anon";

grant references on table "public"."ghg_reporting_boundaries" to "anon";

grant select on table "public"."ghg_reporting_boundaries" to "anon";

grant trigger on table "public"."ghg_reporting_boundaries" to "anon";

grant truncate on table "public"."ghg_reporting_boundaries" to "anon";

grant update on table "public"."ghg_reporting_boundaries" to "anon";

grant insert on table "public"."ghg_reporting_boundaries" to "authenticated";

grant select on table "public"."ghg_reporting_boundaries" to "authenticated";

grant update on table "public"."ghg_reporting_boundaries" to "authenticated";

grant delete on table "public"."ghg_reporting_boundaries" to "service_role";

grant insert on table "public"."ghg_reporting_boundaries" to "service_role";

grant references on table "public"."ghg_reporting_boundaries" to "service_role";

grant select on table "public"."ghg_reporting_boundaries" to "service_role";

grant trigger on table "public"."ghg_reporting_boundaries" to "service_role";

grant truncate on table "public"."ghg_reporting_boundaries" to "service_role";

grant update on table "public"."ghg_reporting_boundaries" to "service_role";

grant delete on table "public"."ghg_signoff_chain" to "anon";

grant insert on table "public"."ghg_signoff_chain" to "anon";

grant references on table "public"."ghg_signoff_chain" to "anon";

grant select on table "public"."ghg_signoff_chain" to "anon";

grant trigger on table "public"."ghg_signoff_chain" to "anon";

grant truncate on table "public"."ghg_signoff_chain" to "anon";

grant update on table "public"."ghg_signoff_chain" to "anon";

grant insert on table "public"."ghg_signoff_chain" to "authenticated";

grant select on table "public"."ghg_signoff_chain" to "authenticated";

grant update on table "public"."ghg_signoff_chain" to "authenticated";

grant delete on table "public"."ghg_signoff_chain" to "service_role";

grant insert on table "public"."ghg_signoff_chain" to "service_role";

grant references on table "public"."ghg_signoff_chain" to "service_role";

grant select on table "public"."ghg_signoff_chain" to "service_role";

grant trigger on table "public"."ghg_signoff_chain" to "service_role";

grant truncate on table "public"."ghg_signoff_chain" to "service_role";

grant update on table "public"."ghg_signoff_chain" to "service_role";

grant delete on table "public"."ghg_submissions" to "anon";

grant insert on table "public"."ghg_submissions" to "anon";

grant references on table "public"."ghg_submissions" to "anon";

grant select on table "public"."ghg_submissions" to "anon";

grant trigger on table "public"."ghg_submissions" to "anon";

grant truncate on table "public"."ghg_submissions" to "anon";

grant update on table "public"."ghg_submissions" to "anon";

grant insert on table "public"."ghg_submissions" to "authenticated";

grant select on table "public"."ghg_submissions" to "authenticated";

grant update on table "public"."ghg_submissions" to "authenticated";

grant delete on table "public"."ghg_submissions" to "service_role";

grant insert on table "public"."ghg_submissions" to "service_role";

grant references on table "public"."ghg_submissions" to "service_role";

grant select on table "public"."ghg_submissions" to "service_role";

grant trigger on table "public"."ghg_submissions" to "service_role";

grant truncate on table "public"."ghg_submissions" to "service_role";

grant update on table "public"."ghg_submissions" to "service_role";

grant delete on table "public"."ghg_suppliers" to "anon";

grant insert on table "public"."ghg_suppliers" to "anon";

grant references on table "public"."ghg_suppliers" to "anon";

grant select on table "public"."ghg_suppliers" to "anon";

grant trigger on table "public"."ghg_suppliers" to "anon";

grant truncate on table "public"."ghg_suppliers" to "anon";

grant update on table "public"."ghg_suppliers" to "anon";

grant insert on table "public"."ghg_suppliers" to "authenticated";

grant select on table "public"."ghg_suppliers" to "authenticated";

grant update on table "public"."ghg_suppliers" to "authenticated";

grant delete on table "public"."ghg_suppliers" to "service_role";

grant insert on table "public"."ghg_suppliers" to "service_role";

grant references on table "public"."ghg_suppliers" to "service_role";

grant select on table "public"."ghg_suppliers" to "service_role";

grant trigger on table "public"."ghg_suppliers" to "service_role";

grant truncate on table "public"."ghg_suppliers" to "service_role";

grant update on table "public"."ghg_suppliers" to "service_role";

grant delete on table "public"."ghg_targets" to "anon";

grant insert on table "public"."ghg_targets" to "anon";

grant references on table "public"."ghg_targets" to "anon";

grant select on table "public"."ghg_targets" to "anon";

grant trigger on table "public"."ghg_targets" to "anon";

grant truncate on table "public"."ghg_targets" to "anon";

grant update on table "public"."ghg_targets" to "anon";

grant insert on table "public"."ghg_targets" to "authenticated";

grant select on table "public"."ghg_targets" to "authenticated";

grant update on table "public"."ghg_targets" to "authenticated";

grant delete on table "public"."ghg_targets" to "service_role";

grant insert on table "public"."ghg_targets" to "service_role";

grant references on table "public"."ghg_targets" to "service_role";

grant select on table "public"."ghg_targets" to "service_role";

grant trigger on table "public"."ghg_targets" to "service_role";

grant truncate on table "public"."ghg_targets" to "service_role";

grant update on table "public"."ghg_targets" to "service_role";

grant delete on table "public"."ghg_uncertainty_analysis" to "anon";

grant insert on table "public"."ghg_uncertainty_analysis" to "anon";

grant references on table "public"."ghg_uncertainty_analysis" to "anon";

grant select on table "public"."ghg_uncertainty_analysis" to "anon";

grant trigger on table "public"."ghg_uncertainty_analysis" to "anon";

grant truncate on table "public"."ghg_uncertainty_analysis" to "anon";

grant update on table "public"."ghg_uncertainty_analysis" to "anon";

grant insert on table "public"."ghg_uncertainty_analysis" to "authenticated";

grant select on table "public"."ghg_uncertainty_analysis" to "authenticated";

grant update on table "public"."ghg_uncertainty_analysis" to "authenticated";

grant delete on table "public"."ghg_uncertainty_analysis" to "service_role";

grant insert on table "public"."ghg_uncertainty_analysis" to "service_role";

grant references on table "public"."ghg_uncertainty_analysis" to "service_role";

grant select on table "public"."ghg_uncertainty_analysis" to "service_role";

grant trigger on table "public"."ghg_uncertainty_analysis" to "service_role";

grant truncate on table "public"."ghg_uncertainty_analysis" to "service_role";

grant update on table "public"."ghg_uncertainty_analysis" to "service_role";

grant delete on table "public"."ghg_verification_findings" to "anon";

grant insert on table "public"."ghg_verification_findings" to "anon";

grant references on table "public"."ghg_verification_findings" to "anon";

grant select on table "public"."ghg_verification_findings" to "anon";

grant trigger on table "public"."ghg_verification_findings" to "anon";

grant truncate on table "public"."ghg_verification_findings" to "anon";

grant update on table "public"."ghg_verification_findings" to "anon";

grant insert on table "public"."ghg_verification_findings" to "authenticated";

grant select on table "public"."ghg_verification_findings" to "authenticated";

grant update on table "public"."ghg_verification_findings" to "authenticated";

grant delete on table "public"."ghg_verification_findings" to "service_role";

grant insert on table "public"."ghg_verification_findings" to "service_role";

grant references on table "public"."ghg_verification_findings" to "service_role";

grant select on table "public"."ghg_verification_findings" to "service_role";

grant trigger on table "public"."ghg_verification_findings" to "service_role";

grant truncate on table "public"."ghg_verification_findings" to "service_role";

grant update on table "public"."ghg_verification_findings" to "service_role";

grant delete on table "public"."ghg_verification_responses" to "anon";

grant insert on table "public"."ghg_verification_responses" to "anon";

grant references on table "public"."ghg_verification_responses" to "anon";

grant select on table "public"."ghg_verification_responses" to "anon";

grant trigger on table "public"."ghg_verification_responses" to "anon";

grant truncate on table "public"."ghg_verification_responses" to "anon";

grant update on table "public"."ghg_verification_responses" to "anon";

grant insert on table "public"."ghg_verification_responses" to "authenticated";

grant select on table "public"."ghg_verification_responses" to "authenticated";

grant update on table "public"."ghg_verification_responses" to "authenticated";

grant delete on table "public"."ghg_verification_responses" to "service_role";

grant insert on table "public"."ghg_verification_responses" to "service_role";

grant references on table "public"."ghg_verification_responses" to "service_role";

grant select on table "public"."ghg_verification_responses" to "service_role";

grant trigger on table "public"."ghg_verification_responses" to "service_role";

grant truncate on table "public"."ghg_verification_responses" to "service_role";

grant update on table "public"."ghg_verification_responses" to "service_role";

grant delete on table "public"."ghg_verifications" to "anon";

grant insert on table "public"."ghg_verifications" to "anon";

grant references on table "public"."ghg_verifications" to "anon";

grant select on table "public"."ghg_verifications" to "anon";

grant trigger on table "public"."ghg_verifications" to "anon";

grant truncate on table "public"."ghg_verifications" to "anon";

grant update on table "public"."ghg_verifications" to "anon";

grant insert on table "public"."ghg_verifications" to "authenticated";

grant select on table "public"."ghg_verifications" to "authenticated";

grant update on table "public"."ghg_verifications" to "authenticated";

grant delete on table "public"."ghg_verifications" to "service_role";

grant insert on table "public"."ghg_verifications" to "service_role";

grant references on table "public"."ghg_verifications" to "service_role";

grant select on table "public"."ghg_verifications" to "service_role";

grant trigger on table "public"."ghg_verifications" to "service_role";

grant truncate on table "public"."ghg_verifications" to "service_role";

grant update on table "public"."ghg_verifications" to "service_role";

grant delete on table "public"."gwp_factors" to "anon";

grant insert on table "public"."gwp_factors" to "anon";

grant references on table "public"."gwp_factors" to "anon";

grant select on table "public"."gwp_factors" to "anon";

grant trigger on table "public"."gwp_factors" to "anon";

grant truncate on table "public"."gwp_factors" to "anon";

grant update on table "public"."gwp_factors" to "anon";

grant select on table "public"."gwp_factors" to "authenticated";

grant delete on table "public"."gwp_factors" to "service_role";

grant insert on table "public"."gwp_factors" to "service_role";

grant references on table "public"."gwp_factors" to "service_role";

grant select on table "public"."gwp_factors" to "service_role";

grant trigger on table "public"."gwp_factors" to "service_role";

grant truncate on table "public"."gwp_factors" to "service_role";

grant update on table "public"."gwp_factors" to "service_role";

grant delete on table "public"."india_grid_zones" to "anon";

grant insert on table "public"."india_grid_zones" to "anon";

grant references on table "public"."india_grid_zones" to "anon";

grant select on table "public"."india_grid_zones" to "anon";

grant trigger on table "public"."india_grid_zones" to "anon";

grant truncate on table "public"."india_grid_zones" to "anon";

grant update on table "public"."india_grid_zones" to "anon";

grant select on table "public"."india_grid_zones" to "authenticated";

grant delete on table "public"."india_grid_zones" to "service_role";

grant insert on table "public"."india_grid_zones" to "service_role";

grant references on table "public"."india_grid_zones" to "service_role";

grant select on table "public"."india_grid_zones" to "service_role";

grant trigger on table "public"."india_grid_zones" to "service_role";

grant truncate on table "public"."india_grid_zones" to "service_role";

grant update on table "public"."india_grid_zones" to "service_role";

grant delete on table "public"."industry_benchmarks" to "anon";

grant insert on table "public"."industry_benchmarks" to "anon";

grant references on table "public"."industry_benchmarks" to "anon";

grant select on table "public"."industry_benchmarks" to "anon";

grant trigger on table "public"."industry_benchmarks" to "anon";

grant truncate on table "public"."industry_benchmarks" to "anon";

grant update on table "public"."industry_benchmarks" to "anon";

grant delete on table "public"."industry_benchmarks" to "authenticated";

grant insert on table "public"."industry_benchmarks" to "authenticated";

grant references on table "public"."industry_benchmarks" to "authenticated";

grant select on table "public"."industry_benchmarks" to "authenticated";

grant trigger on table "public"."industry_benchmarks" to "authenticated";

grant truncate on table "public"."industry_benchmarks" to "authenticated";

grant update on table "public"."industry_benchmarks" to "authenticated";

grant delete on table "public"."industry_benchmarks" to "service_role";

grant insert on table "public"."industry_benchmarks" to "service_role";

grant references on table "public"."industry_benchmarks" to "service_role";

grant select on table "public"."industry_benchmarks" to "service_role";

grant trigger on table "public"."industry_benchmarks" to "service_role";

grant truncate on table "public"."industry_benchmarks" to "service_role";

grant update on table "public"."industry_benchmarks" to "service_role";

grant delete on table "public"."leads" to "anon";

grant insert on table "public"."leads" to "anon";

grant references on table "public"."leads" to "anon";

grant select on table "public"."leads" to "anon";

grant trigger on table "public"."leads" to "anon";

grant truncate on table "public"."leads" to "anon";

grant update on table "public"."leads" to "anon";

grant delete on table "public"."leads" to "service_role";

grant insert on table "public"."leads" to "service_role";

grant references on table "public"."leads" to "service_role";

grant select on table "public"."leads" to "service_role";

grant trigger on table "public"."leads" to "service_role";

grant truncate on table "public"."leads" to "service_role";

grant update on table "public"."leads" to "service_role";

grant delete on table "public"."mfa_enforcement_config" to "anon";

grant insert on table "public"."mfa_enforcement_config" to "anon";

grant references on table "public"."mfa_enforcement_config" to "anon";

grant select on table "public"."mfa_enforcement_config" to "anon";

grant trigger on table "public"."mfa_enforcement_config" to "anon";

grant truncate on table "public"."mfa_enforcement_config" to "anon";

grant update on table "public"."mfa_enforcement_config" to "anon";

grant delete on table "public"."mfa_enforcement_config" to "authenticated";

grant insert on table "public"."mfa_enforcement_config" to "authenticated";

grant references on table "public"."mfa_enforcement_config" to "authenticated";

grant select on table "public"."mfa_enforcement_config" to "authenticated";

grant trigger on table "public"."mfa_enforcement_config" to "authenticated";

grant truncate on table "public"."mfa_enforcement_config" to "authenticated";

grant update on table "public"."mfa_enforcement_config" to "authenticated";

grant delete on table "public"."mfa_enforcement_config" to "service_role";

grant insert on table "public"."mfa_enforcement_config" to "service_role";

grant references on table "public"."mfa_enforcement_config" to "service_role";

grant select on table "public"."mfa_enforcement_config" to "service_role";

grant trigger on table "public"."mfa_enforcement_config" to "service_role";

grant truncate on table "public"."mfa_enforcement_config" to "service_role";

grant update on table "public"."mfa_enforcement_config" to "service_role";

grant delete on table "public"."platform_permissions" to "anon";

grant insert on table "public"."platform_permissions" to "anon";

grant references on table "public"."platform_permissions" to "anon";

grant select on table "public"."platform_permissions" to "anon";

grant trigger on table "public"."platform_permissions" to "anon";

grant truncate on table "public"."platform_permissions" to "anon";

grant update on table "public"."platform_permissions" to "anon";

grant select on table "public"."platform_permissions" to "authenticated";

grant delete on table "public"."platform_permissions" to "service_role";

grant insert on table "public"."platform_permissions" to "service_role";

grant references on table "public"."platform_permissions" to "service_role";

grant select on table "public"."platform_permissions" to "service_role";

grant trigger on table "public"."platform_permissions" to "service_role";

grant truncate on table "public"."platform_permissions" to "service_role";

grant update on table "public"."platform_permissions" to "service_role";

grant delete on table "public"."platform_roles" to "anon";

grant insert on table "public"."platform_roles" to "anon";

grant references on table "public"."platform_roles" to "anon";

grant select on table "public"."platform_roles" to "anon";

grant trigger on table "public"."platform_roles" to "anon";

grant truncate on table "public"."platform_roles" to "anon";

grant update on table "public"."platform_roles" to "anon";

grant select on table "public"."platform_roles" to "authenticated";

grant delete on table "public"."platform_roles" to "service_role";

grant insert on table "public"."platform_roles" to "service_role";

grant references on table "public"."platform_roles" to "service_role";

grant select on table "public"."platform_roles" to "service_role";

grant trigger on table "public"."platform_roles" to "service_role";

grant truncate on table "public"."platform_roles" to "service_role";

grant update on table "public"."platform_roles" to "service_role";

grant delete on table "public"."product_emissions" to "anon";

grant insert on table "public"."product_emissions" to "anon";

grant references on table "public"."product_emissions" to "anon";

grant select on table "public"."product_emissions" to "anon";

grant trigger on table "public"."product_emissions" to "anon";

grant truncate on table "public"."product_emissions" to "anon";

grant update on table "public"."product_emissions" to "anon";

grant insert on table "public"."product_emissions" to "authenticated";

grant select on table "public"."product_emissions" to "authenticated";

grant update on table "public"."product_emissions" to "authenticated";

grant delete on table "public"."product_emissions" to "service_role";

grant insert on table "public"."product_emissions" to "service_role";

grant references on table "public"."product_emissions" to "service_role";

grant select on table "public"."product_emissions" to "service_role";

grant trigger on table "public"."product_emissions" to "service_role";

grant truncate on table "public"."product_emissions" to "service_role";

grant update on table "public"."product_emissions" to "service_role";

grant delete on table "public"."rate_limit_config" to "anon";

grant insert on table "public"."rate_limit_config" to "anon";

grant references on table "public"."rate_limit_config" to "anon";

grant select on table "public"."rate_limit_config" to "anon";

grant trigger on table "public"."rate_limit_config" to "anon";

grant truncate on table "public"."rate_limit_config" to "anon";

grant update on table "public"."rate_limit_config" to "anon";

grant delete on table "public"."rate_limit_config" to "authenticated";

grant insert on table "public"."rate_limit_config" to "authenticated";

grant references on table "public"."rate_limit_config" to "authenticated";

grant select on table "public"."rate_limit_config" to "authenticated";

grant trigger on table "public"."rate_limit_config" to "authenticated";

grant truncate on table "public"."rate_limit_config" to "authenticated";

grant update on table "public"."rate_limit_config" to "authenticated";

grant delete on table "public"."rate_limit_config" to "service_role";

grant insert on table "public"."rate_limit_config" to "service_role";

grant references on table "public"."rate_limit_config" to "service_role";

grant select on table "public"."rate_limit_config" to "service_role";

grant trigger on table "public"."rate_limit_config" to "service_role";

grant truncate on table "public"."rate_limit_config" to "service_role";

grant update on table "public"."rate_limit_config" to "service_role";

grant delete on table "public"."regulatory_filings" to "anon";

grant insert on table "public"."regulatory_filings" to "anon";

grant references on table "public"."regulatory_filings" to "anon";

grant select on table "public"."regulatory_filings" to "anon";

grant trigger on table "public"."regulatory_filings" to "anon";

grant truncate on table "public"."regulatory_filings" to "anon";

grant update on table "public"."regulatory_filings" to "anon";

grant delete on table "public"."regulatory_filings" to "authenticated";

grant insert on table "public"."regulatory_filings" to "authenticated";

grant references on table "public"."regulatory_filings" to "authenticated";

grant select on table "public"."regulatory_filings" to "authenticated";

grant trigger on table "public"."regulatory_filings" to "authenticated";

grant truncate on table "public"."regulatory_filings" to "authenticated";

grant update on table "public"."regulatory_filings" to "authenticated";

grant delete on table "public"."regulatory_filings" to "service_role";

grant insert on table "public"."regulatory_filings" to "service_role";

grant references on table "public"."regulatory_filings" to "service_role";

grant select on table "public"."regulatory_filings" to "service_role";

grant trigger on table "public"."regulatory_filings" to "service_role";

grant truncate on table "public"."regulatory_filings" to "service_role";

grant update on table "public"."regulatory_filings" to "service_role";

grant delete on table "public"."role_permissions" to "anon";

grant insert on table "public"."role_permissions" to "anon";

grant references on table "public"."role_permissions" to "anon";

grant select on table "public"."role_permissions" to "anon";

grant trigger on table "public"."role_permissions" to "anon";

grant truncate on table "public"."role_permissions" to "anon";

grant update on table "public"."role_permissions" to "anon";

grant select on table "public"."role_permissions" to "authenticated";

grant delete on table "public"."role_permissions" to "service_role";

grant insert on table "public"."role_permissions" to "service_role";

grant references on table "public"."role_permissions" to "service_role";

grant select on table "public"."role_permissions" to "service_role";

grant trigger on table "public"."role_permissions" to "service_role";

grant truncate on table "public"."role_permissions" to "service_role";

grant update on table "public"."role_permissions" to "service_role";

grant delete on table "public"."ropa_entries" to "anon";

grant insert on table "public"."ropa_entries" to "anon";

grant references on table "public"."ropa_entries" to "anon";

grant select on table "public"."ropa_entries" to "anon";

grant trigger on table "public"."ropa_entries" to "anon";

grant truncate on table "public"."ropa_entries" to "anon";

grant update on table "public"."ropa_entries" to "anon";

grant delete on table "public"."ropa_entries" to "authenticated";

grant insert on table "public"."ropa_entries" to "authenticated";

grant references on table "public"."ropa_entries" to "authenticated";

grant select on table "public"."ropa_entries" to "authenticated";

grant trigger on table "public"."ropa_entries" to "authenticated";

grant truncate on table "public"."ropa_entries" to "authenticated";

grant update on table "public"."ropa_entries" to "authenticated";

grant delete on table "public"."ropa_entries" to "service_role";

grant insert on table "public"."ropa_entries" to "service_role";

grant references on table "public"."ropa_entries" to "service_role";

grant select on table "public"."ropa_entries" to "service_role";

grant trigger on table "public"."ropa_entries" to "service_role";

grant truncate on table "public"."ropa_entries" to "service_role";

grant update on table "public"."ropa_entries" to "service_role";

grant delete on table "public"."sbti_milestones" to "anon";

grant insert on table "public"."sbti_milestones" to "anon";

grant references on table "public"."sbti_milestones" to "anon";

grant select on table "public"."sbti_milestones" to "anon";

grant trigger on table "public"."sbti_milestones" to "anon";

grant truncate on table "public"."sbti_milestones" to "anon";

grant update on table "public"."sbti_milestones" to "anon";

grant delete on table "public"."sbti_milestones" to "authenticated";

grant insert on table "public"."sbti_milestones" to "authenticated";

grant references on table "public"."sbti_milestones" to "authenticated";

grant select on table "public"."sbti_milestones" to "authenticated";

grant trigger on table "public"."sbti_milestones" to "authenticated";

grant truncate on table "public"."sbti_milestones" to "authenticated";

grant update on table "public"."sbti_milestones" to "authenticated";

grant delete on table "public"."sbti_milestones" to "service_role";

grant insert on table "public"."sbti_milestones" to "service_role";

grant references on table "public"."sbti_milestones" to "service_role";

grant select on table "public"."sbti_milestones" to "service_role";

grant trigger on table "public"."sbti_milestones" to "service_role";

grant truncate on table "public"."sbti_milestones" to "service_role";

grant update on table "public"."sbti_milestones" to "service_role";

grant delete on table "public"."scope3_categories" to "anon";

grant insert on table "public"."scope3_categories" to "anon";

grant references on table "public"."scope3_categories" to "anon";

grant select on table "public"."scope3_categories" to "anon";

grant trigger on table "public"."scope3_categories" to "anon";

grant truncate on table "public"."scope3_categories" to "anon";

grant update on table "public"."scope3_categories" to "anon";

grant select on table "public"."scope3_categories" to "authenticated";

grant delete on table "public"."scope3_categories" to "service_role";

grant insert on table "public"."scope3_categories" to "service_role";

grant references on table "public"."scope3_categories" to "service_role";

grant select on table "public"."scope3_categories" to "service_role";

grant trigger on table "public"."scope3_categories" to "service_role";

grant truncate on table "public"."scope3_categories" to "service_role";

grant update on table "public"."scope3_categories" to "service_role";

grant delete on table "public"."sector_field_templates" to "anon";

grant insert on table "public"."sector_field_templates" to "anon";

grant references on table "public"."sector_field_templates" to "anon";

grant select on table "public"."sector_field_templates" to "anon";

grant trigger on table "public"."sector_field_templates" to "anon";

grant truncate on table "public"."sector_field_templates" to "anon";

grant update on table "public"."sector_field_templates" to "anon";

grant insert on table "public"."sector_field_templates" to "authenticated";

grant select on table "public"."sector_field_templates" to "authenticated";

grant update on table "public"."sector_field_templates" to "authenticated";

grant delete on table "public"."sector_field_templates" to "service_role";

grant insert on table "public"."sector_field_templates" to "service_role";

grant references on table "public"."sector_field_templates" to "service_role";

grant select on table "public"."sector_field_templates" to "service_role";

grant trigger on table "public"."sector_field_templates" to "service_role";

grant truncate on table "public"."sector_field_templates" to "service_role";

grant update on table "public"."sector_field_templates" to "service_role";

grant delete on table "public"."security_incidents" to "anon";

grant insert on table "public"."security_incidents" to "anon";

grant references on table "public"."security_incidents" to "anon";

grant select on table "public"."security_incidents" to "anon";

grant trigger on table "public"."security_incidents" to "anon";

grant truncate on table "public"."security_incidents" to "anon";

grant update on table "public"."security_incidents" to "anon";

grant delete on table "public"."security_incidents" to "authenticated";

grant insert on table "public"."security_incidents" to "authenticated";

grant references on table "public"."security_incidents" to "authenticated";

grant select on table "public"."security_incidents" to "authenticated";

grant trigger on table "public"."security_incidents" to "authenticated";

grant truncate on table "public"."security_incidents" to "authenticated";

grant update on table "public"."security_incidents" to "authenticated";

grant delete on table "public"."security_incidents" to "service_role";

grant insert on table "public"."security_incidents" to "service_role";

grant references on table "public"."security_incidents" to "service_role";

grant select on table "public"."security_incidents" to "service_role";

grant trigger on table "public"."security_incidents" to "service_role";

grant truncate on table "public"."security_incidents" to "service_role";

grant update on table "public"."security_incidents" to "service_role";

grant delete on table "public"."supplier_emissions" to "anon";

grant insert on table "public"."supplier_emissions" to "anon";

grant references on table "public"."supplier_emissions" to "anon";

grant select on table "public"."supplier_emissions" to "anon";

grant trigger on table "public"."supplier_emissions" to "anon";

grant truncate on table "public"."supplier_emissions" to "anon";

grant update on table "public"."supplier_emissions" to "anon";

grant insert on table "public"."supplier_emissions" to "authenticated";

grant select on table "public"."supplier_emissions" to "authenticated";

grant update on table "public"."supplier_emissions" to "authenticated";

grant delete on table "public"."supplier_emissions" to "service_role";

grant insert on table "public"."supplier_emissions" to "service_role";

grant references on table "public"."supplier_emissions" to "service_role";

grant select on table "public"."supplier_emissions" to "service_role";

grant trigger on table "public"."supplier_emissions" to "service_role";

grant truncate on table "public"."supplier_emissions" to "service_role";

grant update on table "public"."supplier_emissions" to "service_role";

grant delete on table "public"."user_organization_roles" to "anon";

grant insert on table "public"."user_organization_roles" to "anon";

grant references on table "public"."user_organization_roles" to "anon";

grant select on table "public"."user_organization_roles" to "anon";

grant trigger on table "public"."user_organization_roles" to "anon";

grant truncate on table "public"."user_organization_roles" to "anon";

grant update on table "public"."user_organization_roles" to "anon";

grant insert on table "public"."user_organization_roles" to "authenticated";

grant select on table "public"."user_organization_roles" to "authenticated";

grant update on table "public"."user_organization_roles" to "authenticated";

grant delete on table "public"."user_organization_roles" to "service_role";

grant insert on table "public"."user_organization_roles" to "service_role";

grant references on table "public"."user_organization_roles" to "service_role";

grant select on table "public"."user_organization_roles" to "service_role";

grant trigger on table "public"."user_organization_roles" to "service_role";

grant truncate on table "public"."user_organization_roles" to "service_role";

grant update on table "public"."user_organization_roles" to "service_role";

grant delete on table "public"."user_sessions" to "anon";

grant insert on table "public"."user_sessions" to "anon";

grant references on table "public"."user_sessions" to "anon";

grant select on table "public"."user_sessions" to "anon";

grant trigger on table "public"."user_sessions" to "anon";

grant truncate on table "public"."user_sessions" to "anon";

grant update on table "public"."user_sessions" to "anon";

grant delete on table "public"."user_sessions" to "authenticated";

grant insert on table "public"."user_sessions" to "authenticated";

grant references on table "public"."user_sessions" to "authenticated";

grant select on table "public"."user_sessions" to "authenticated";

grant trigger on table "public"."user_sessions" to "authenticated";

grant truncate on table "public"."user_sessions" to "authenticated";

grant update on table "public"."user_sessions" to "authenticated";

grant delete on table "public"."user_sessions" to "service_role";

grant insert on table "public"."user_sessions" to "service_role";

grant references on table "public"."user_sessions" to "service_role";

grant select on table "public"."user_sessions" to "service_role";

grant trigger on table "public"."user_sessions" to "service_role";

grant truncate on table "public"."user_sessions" to "service_role";

grant update on table "public"."user_sessions" to "service_role";

grant delete on table "public"."vendor_security_assessments" to "anon";

grant insert on table "public"."vendor_security_assessments" to "anon";

grant references on table "public"."vendor_security_assessments" to "anon";

grant select on table "public"."vendor_security_assessments" to "anon";

grant trigger on table "public"."vendor_security_assessments" to "anon";

grant truncate on table "public"."vendor_security_assessments" to "anon";

grant update on table "public"."vendor_security_assessments" to "anon";

grant delete on table "public"."vendor_security_assessments" to "authenticated";

grant insert on table "public"."vendor_security_assessments" to "authenticated";

grant references on table "public"."vendor_security_assessments" to "authenticated";

grant select on table "public"."vendor_security_assessments" to "authenticated";

grant trigger on table "public"."vendor_security_assessments" to "authenticated";

grant truncate on table "public"."vendor_security_assessments" to "authenticated";

grant update on table "public"."vendor_security_assessments" to "authenticated";

grant delete on table "public"."vendor_security_assessments" to "service_role";

grant insert on table "public"."vendor_security_assessments" to "service_role";

grant references on table "public"."vendor_security_assessments" to "service_role";

grant select on table "public"."vendor_security_assessments" to "service_role";

grant trigger on table "public"."vendor_security_assessments" to "service_role";

grant truncate on table "public"."vendor_security_assessments" to "service_role";

grant update on table "public"."vendor_security_assessments" to "service_role";

grant delete on table "public"."verifiers" to "anon";

grant insert on table "public"."verifiers" to "anon";

grant references on table "public"."verifiers" to "anon";

grant select on table "public"."verifiers" to "anon";

grant trigger on table "public"."verifiers" to "anon";

grant truncate on table "public"."verifiers" to "anon";

grant update on table "public"."verifiers" to "anon";

grant insert on table "public"."verifiers" to "authenticated";

grant select on table "public"."verifiers" to "authenticated";

grant update on table "public"."verifiers" to "authenticated";

grant delete on table "public"."verifiers" to "service_role";

grant insert on table "public"."verifiers" to "service_role";

grant references on table "public"."verifiers" to "service_role";

grant select on table "public"."verifiers" to "service_role";

grant trigger on table "public"."verifiers" to "service_role";

grant truncate on table "public"."verifiers" to "service_role";

grant update on table "public"."verifiers" to "service_role";

grant delete on table "public"."webhook_delivery_log" to "anon";

grant insert on table "public"."webhook_delivery_log" to "anon";

grant references on table "public"."webhook_delivery_log" to "anon";

grant select on table "public"."webhook_delivery_log" to "anon";

grant trigger on table "public"."webhook_delivery_log" to "anon";

grant truncate on table "public"."webhook_delivery_log" to "anon";

grant update on table "public"."webhook_delivery_log" to "anon";

grant delete on table "public"."webhook_delivery_log" to "authenticated";

grant insert on table "public"."webhook_delivery_log" to "authenticated";

grant references on table "public"."webhook_delivery_log" to "authenticated";

grant select on table "public"."webhook_delivery_log" to "authenticated";

grant trigger on table "public"."webhook_delivery_log" to "authenticated";

grant truncate on table "public"."webhook_delivery_log" to "authenticated";

grant update on table "public"."webhook_delivery_log" to "authenticated";

grant delete on table "public"."webhook_delivery_log" to "service_role";

grant insert on table "public"."webhook_delivery_log" to "service_role";

grant references on table "public"."webhook_delivery_log" to "service_role";

grant select on table "public"."webhook_delivery_log" to "service_role";

grant trigger on table "public"."webhook_delivery_log" to "service_role";

grant truncate on table "public"."webhook_delivery_log" to "service_role";

grant update on table "public"."webhook_delivery_log" to "service_role";

grant delete on table "public"."webhook_subscriptions" to "anon";

grant insert on table "public"."webhook_subscriptions" to "anon";

grant references on table "public"."webhook_subscriptions" to "anon";

grant select on table "public"."webhook_subscriptions" to "anon";

grant trigger on table "public"."webhook_subscriptions" to "anon";

grant truncate on table "public"."webhook_subscriptions" to "anon";

grant update on table "public"."webhook_subscriptions" to "anon";

grant delete on table "public"."webhook_subscriptions" to "authenticated";

grant insert on table "public"."webhook_subscriptions" to "authenticated";

grant references on table "public"."webhook_subscriptions" to "authenticated";

grant select on table "public"."webhook_subscriptions" to "authenticated";

grant trigger on table "public"."webhook_subscriptions" to "authenticated";

grant truncate on table "public"."webhook_subscriptions" to "authenticated";

grant update on table "public"."webhook_subscriptions" to "authenticated";

grant delete on table "public"."webhook_subscriptions" to "service_role";

grant insert on table "public"."webhook_subscriptions" to "service_role";

grant references on table "public"."webhook_subscriptions" to "service_role";

grant select on table "public"."webhook_subscriptions" to "service_role";

grant trigger on table "public"."webhook_subscriptions" to "service_role";

grant truncate on table "public"."webhook_subscriptions" to "service_role";

grant update on table "public"."webhook_subscriptions" to "service_role";


  create policy "activity_insert"
  on "public"."activity_data"
  as permissive
  for insert
  to public
with check (((organization_id = ANY (public.my_org_ids())) AND public.has_permission(organization_id, 'data:entry'::text)));



  create policy "activity_no_delete"
  on "public"."activity_data"
  as permissive
  for delete
  to public
using (false);



  create policy "activity_select"
  on "public"."activity_data"
  as permissive
  for select
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "activity_update"
  on "public"."activity_data"
  as permissive
  for update
  to public
using (((organization_id = ANY (public.my_org_ids())) AND public.has_permission(organization_id, 'data:entry'::text)));



  create policy "ai_models_read_safe"
  on "public"."ai_models"
  as permissive
  for select
  to public
using ((auth.role() = 'authenticated'::text));



  create policy "iso_ai_validation"
  on "public"."ai_validation"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "api_keys_insert"
  on "public"."api_keys"
  as permissive
  for insert
  to public
with check (((organization_id = ANY (public.my_org_ids())) AND public.has_permission(organization_id, 'api_keys:manage'::text)));



  create policy "api_keys_no_delete"
  on "public"."api_keys"
  as permissive
  for delete
  to public
using (false);



  create policy "api_keys_select"
  on "public"."api_keys"
  as permissive
  for select
  to public
using (((organization_id = ANY (public.my_org_ids())) AND public.has_permission(organization_id, 'api_keys:manage'::text)));



  create policy "api_keys_update"
  on "public"."api_keys"
  as permissive
  for update
  to public
using (((organization_id = ANY (public.my_org_ids())) AND public.has_permission(organization_id, 'api_keys:manage'::text)));



  create policy "offsets_all"
  on "public"."carbon_offsets"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "iso_assets"
  on "public"."client_assets"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "iso_legal_ents"
  on "public"."client_legal_entities"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "iso_client_orgs"
  on "public"."client_organizations"
  as permissive
  for all
  to public
using ((id = ANY (public.my_org_ids())));



  create policy "iso_sites"
  on "public"."client_sites"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "consent_insert_own"
  on "public"."consent_records"
  as permissive
  for insert
  to public
with check ((user_id = auth.uid()));



  create policy "consent_select_own"
  on "public"."consent_records"
  as permissive
  for select
  to public
using (((user_id = auth.uid()) OR (organization_id = ANY (public.my_org_ids())) OR (auth.role() = 'service_role'::text)));



  create policy "consent_service_role"
  on "public"."consent_records"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "consent_update_own"
  on "public"."consent_records"
  as permissive
  for update
  to public
using (((user_id = auth.uid()) OR (auth.role() = 'service_role'::text)))
with check (((user_id = auth.uid()) OR (auth.role() = 'service_role'::text)));



  create policy "consultants_select_own"
  on "public"."consultants"
  as permissive
  for select
  to public
using (((user_id = auth.uid()) OR (id IN ( SELECT client_organizations.assigned_consultant_id
   FROM public.client_organizations
  WHERE (client_organizations.id = ANY (public.my_org_ids()))))));



  create policy "consultants_update_own"
  on "public"."consultants"
  as permissive
  for update
  to public
using ((user_id = auth.uid()));



  create policy "ccpa_req_public_insert"
  on "public"."consumer_data_requests"
  as permissive
  for insert
  to public
with check (true);



  create policy "ccpa_req_service_all"
  on "public"."consumer_data_requests"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "portability_own"
  on "public"."data_portability_exports"
  as permissive
  for all
  to public
using (((user_id = auth.uid()) OR (auth.role() = 'service_role'::text)));



  create policy "portability_svc"
  on "public"."data_portability_exports"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "iso_dq_audit"
  on "public"."data_quality_audit"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "retention_read"
  on "public"."data_retention_policies"
  as permissive
  for select
  to public
using (true);



  create policy "opt_out_insert_all"
  on "public"."data_sale_opt_outs"
  as permissive
  for insert
  to public
with check (true);



  create policy "opt_out_svc_all"
  on "public"."data_sale_opt_outs"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "dsar_insert_public"
  on "public"."data_subject_access_requests"
  as permissive
  for insert
  to public
with check (true);



  create policy "dsar_read_own"
  on "public"."data_subject_access_requests"
  as permissive
  for select
  to public
using ((((user_id IS NOT NULL) AND (user_id = auth.uid())) OR (organization_id = ANY (public.my_org_ids())) OR (auth.role() = 'service_role'::text)));



  create policy "dsar_service_all"
  on "public"."data_subject_access_requests"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "erasure_admin_read"
  on "public"."dpdp_erasure_requests"
  as permissive
  for select
  to public
using ((auth.role() = 'service_role'::text));



  create policy "erasure_own"
  on "public"."dpdp_erasure_requests"
  as permissive
  for all
  to public
using ((user_id = auth.uid()));



  create policy "ref_read_all"
  on "public"."emission_factor_sources"
  as permissive
  for select
  to public
using (true);



  create policy "ref_read_all"
  on "public"."emission_factor_versions"
  as permissive
  for select
  to public
using (true);



  create policy "ref_read_all"
  on "public"."emission_factors"
  as permissive
  for select
  to public
using (true);



  create policy "vault_insert_admin"
  on "public"."erp_connection_vault"
  as permissive
  for insert
  to public
with check (((organization_id = ANY (public.my_org_ids())) AND public.has_permission(organization_id, 'erp:admin'::text)));



  create policy "vault_no_delete"
  on "public"."erp_connection_vault"
  as permissive
  for delete
  to public
using (false);



  create policy "vault_select_admin"
  on "public"."erp_connection_vault"
  as permissive
  for select
  to public
using (((organization_id = ANY (public.my_org_ids())) AND public.has_permission(organization_id, 'erp:admin'::text)));



  create policy "iso_erp_mappings"
  on "public"."erp_field_mappings"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "iso_erp_logs"
  on "public"."erp_sync_logs"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "iso_erp_systems"
  on "public"."erp_systems"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "flags_manage"
  on "public"."feature_flags"
  as permissive
  for all
  to public
using ((((auth.jwt() ->> 'role'::text) = 'platform_admin'::text) OR (auth.role() = 'service_role'::text)));



  create policy "flags_read"
  on "public"."feature_flags"
  as permissive
  for select
  to public
using (true);



  create policy "iso_fleet_logs"
  on "public"."fleet_monthly_logs"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "iso_fleet"
  on "public"."fleet_vehicles"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "fd_all"
  on "public"."framework_disclosures"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "fi_read_all"
  on "public"."framework_indicators"
  as permissive
  for select
  to public
using (true);



  create policy "iso_anomalies"
  on "public"."ghg_anomaly_flags"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "auditlog_no_delete"
  on "public"."ghg_audit_log"
  as permissive
  for delete
  to public
using (false);



  create policy "auditlog_no_update"
  on "public"."ghg_audit_log"
  as permissive
  for update
  to public
using (false);



  create policy "auditlog_read"
  on "public"."ghg_audit_log"
  as permissive
  for select
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "iso_base_years"
  on "public"."ghg_base_years"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "ref_read_all"
  on "public"."ghg_calculation_methodologies"
  as permissive
  for select
  to public
using (true);



  create policy "iso_corrective"
  on "public"."ghg_corrective_actions"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "iso_dqa"
  on "public"."ghg_data_quality_assessments"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "docs_insert"
  on "public"."ghg_documents"
  as permissive
  for insert
  to public
with check (((organization_id = ANY (public.my_org_ids())) AND public.has_permission(organization_id, 'documents:upload'::text)));



  create policy "docs_no_delete"
  on "public"."ghg_documents"
  as permissive
  for delete
  to public
using (false);



  create policy "docs_select"
  on "public"."ghg_documents"
  as permissive
  for select
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "docs_update"
  on "public"."ghg_documents"
  as permissive
  for update
  to public
using (((organization_id = ANY (public.my_org_ids())) AND public.has_permission(organization_id, 'documents:review'::text)));



  create policy "iso_src_register"
  on "public"."ghg_emission_source_register"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "iso_hazmat"
  on "public"."ghg_hazardous_consumables"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "ref_read_all"
  on "public"."ghg_industry_segments"
  as permissive
  for select
  to public
using (true);



  create policy "iso_intensity"
  on "public"."ghg_intensity_metrics"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "iso_int_audits"
  on "public"."ghg_internal_audits"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "iso_mgmt_reviews"
  on "public"."ghg_management_reviews"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "iso_ml_features"
  on "public"."ghg_ml_features"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "readings_insert"
  on "public"."ghg_monthly_readings"
  as permissive
  for insert
  to public
with check (((organization_id = ANY (public.my_org_ids())) AND public.has_permission(organization_id, 'readings:write'::text)));



  create policy "readings_no_delete"
  on "public"."ghg_monthly_readings"
  as permissive
  for delete
  to public
using (false);



  create policy "readings_select"
  on "public"."ghg_monthly_readings"
  as permissive
  for select
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "readings_update"
  on "public"."ghg_monthly_readings"
  as permissive
  for update
  to public
using (((organization_id = ANY (public.my_org_ids())) AND public.has_permission(organization_id, 'readings:write'::text)));



  create policy "iso_notifications"
  on "public"."ghg_notifications"
  as permissive
  for all
  to public
using ((recipient_user_id = auth.uid()));



  create policy "iso_amendments"
  on "public"."ghg_reading_amendments"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "iso_boundaries"
  on "public"."ghg_reporting_boundaries"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "signoff_insert"
  on "public"."ghg_signoff_chain"
  as permissive
  for insert
  to public
with check (((organization_id = ANY (public.my_org_ids())) AND public.has_permission(organization_id, 'signoff:execute'::text)));



  create policy "signoff_no_delete"
  on "public"."ghg_signoff_chain"
  as permissive
  for delete
  to public
using (false);



  create policy "signoff_no_update"
  on "public"."ghg_signoff_chain"
  as permissive
  for update
  to public
using (false);



  create policy "signoff_select"
  on "public"."ghg_signoff_chain"
  as permissive
  for select
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "submissions_insert"
  on "public"."ghg_submissions"
  as permissive
  for insert
  to public
with check (((organization_id = ANY (public.my_org_ids())) AND public.has_permission(organization_id, 'submissions:create'::text)));



  create policy "submissions_no_delete"
  on "public"."ghg_submissions"
  as permissive
  for delete
  to public
using (false);



  create policy "submissions_select"
  on "public"."ghg_submissions"
  as permissive
  for select
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "submissions_update"
  on "public"."ghg_submissions"
  as permissive
  for update
  to public
using (((organization_id = ANY (public.my_org_ids())) AND public.has_permission(organization_id, 'submissions:manage'::text)));



  create policy "iso_suppliers"
  on "public"."ghg_suppliers"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "iso_targets"
  on "public"."ghg_targets"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "iso_uncertainty"
  on "public"."ghg_uncertainty_analysis"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "iso_findings"
  on "public"."ghg_verification_findings"
  as permissive
  for select
  to public
using ((verification_id IN ( SELECT ghg_verifications.id
   FROM public.ghg_verifications
  WHERE (ghg_verifications.organization_id = ANY (public.my_org_ids())))));



  create policy "iso_find_resp"
  on "public"."ghg_verification_responses"
  as permissive
  for all
  to public
using ((finding_id IN ( SELECT ghg_verification_findings.id
   FROM public.ghg_verification_findings
  WHERE (ghg_verification_findings.verification_id IN ( SELECT ghg_verifications.id
           FROM public.ghg_verifications
          WHERE (ghg_verifications.organization_id = ANY (public.my_org_ids())))))));



  create policy "iso_verifications"
  on "public"."ghg_verifications"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "ref_read_all"
  on "public"."gwp_factors"
  as permissive
  for select
  to public
using (true);



  create policy "ref_read_all"
  on "public"."india_grid_zones"
  as permissive
  for select
  to public
using (true);



  create policy "benchmarks_read"
  on "public"."industry_benchmarks"
  as permissive
  for select
  to public
using (true);



  create policy "allow public insert"
  on "public"."leads"
  as permissive
  for insert
  to public
with check (true);



  create policy "mfa_config_read"
  on "public"."mfa_enforcement_config"
  as permissive
  for select
  to public
using ((auth.uid() IS NOT NULL));



  create policy "mfa_config_service"
  on "public"."mfa_enforcement_config"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "iso_product_emits"
  on "public"."product_emissions"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "rate_limit_manage"
  on "public"."rate_limit_config"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "rate_limit_read"
  on "public"."rate_limit_config"
  as permissive
  for select
  to public
using (true);



  create policy "filings_all"
  on "public"."regulatory_filings"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "ropa_auth_read"
  on "public"."ropa_entries"
  as permissive
  for select
  to public
using ((auth.uid() IS NOT NULL));



  create policy "ropa_service_all"
  on "public"."ropa_entries"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "milestones_all"
  on "public"."sbti_milestones"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "ref_read_all"
  on "public"."scope3_categories"
  as permissive
  for select
  to public
using (true);



  create policy "sft_read_all"
  on "public"."sector_field_templates"
  as permissive
  for select
  to public
using ((auth.role() = 'authenticated'::text));



  create policy "incidents_org_read"
  on "public"."security_incidents"
  as permissive
  for select
  to public
using (((organization_id = ANY (public.my_org_ids())) OR (auth.role() = 'service_role'::text)));



  create policy "incidents_service_all"
  on "public"."security_incidents"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "iso_supplier_emits"
  on "public"."supplier_emissions"
  as permissive
  for all
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "uor_insert"
  on "public"."user_organization_roles"
  as permissive
  for insert
  to public
with check (((organization_id = ANY (public.my_org_ids())) AND public.has_permission(organization_id, 'users:manage'::text)));



  create policy "uor_select"
  on "public"."user_organization_roles"
  as permissive
  for select
  to public
using (((organization_id = ANY (public.my_org_ids())) OR (user_id = auth.uid())));



  create policy "uor_update"
  on "public"."user_organization_roles"
  as permissive
  for update
  to public
using (((organization_id = ANY (public.my_org_ids())) AND public.has_permission(organization_id, 'users:manage'::text)));



  create policy "sessions_admin_read"
  on "public"."user_sessions"
  as permissive
  for select
  to public
using (((organization_id = ANY (public.my_org_ids())) AND public.has_permission(organization_id, 'users:manage'::text)));



  create policy "sessions_own"
  on "public"."user_sessions"
  as permissive
  for all
  to public
using ((user_id = auth.uid()));



  create policy "vendor_auth_read"
  on "public"."vendor_security_assessments"
  as permissive
  for select
  to public
using ((auth.uid() IS NOT NULL));



  create policy "vendor_service_all"
  on "public"."vendor_security_assessments"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "webhook_log_read"
  on "public"."webhook_delivery_log"
  as permissive
  for select
  to public
using ((organization_id = ANY (public.my_org_ids())));



  create policy "webhooks_manage"
  on "public"."webhook_subscriptions"
  as permissive
  for all
  to public
using (((organization_id = ANY (public.my_org_ids())) AND public.has_permission(organization_id, 'webhooks:manage'::text)));


CREATE TRIGGER ghg_audit_activity_data AFTER INSERT OR DELETE OR UPDATE ON public.activity_data FOR EACH ROW EXECUTE FUNCTION public.ghg_audit_trigger();

CREATE TRIGGER trg_touch_activity BEFORE UPDATE ON public.activity_data FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER ghg_audit_ai_validation AFTER INSERT OR DELETE OR UPDATE ON public.ai_validation FOR EACH ROW EXECUTE FUNCTION public.ghg_audit_trigger();

CREATE TRIGGER trg_touch_carbon_offsets BEFORE UPDATE ON public.carbon_offsets FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_prevent_hard_delete_client_assets BEFORE DELETE ON public.client_assets FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();

CREATE TRIGGER trg_prevent_hard_delete_client_legal_entities BEFORE DELETE ON public.client_legal_entities FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();

CREATE TRIGGER trg_prevent_hard_delete_client_organizations BEFORE DELETE ON public.client_organizations FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();

CREATE TRIGGER trg_touch_orgs BEFORE UPDATE ON public.client_organizations FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_prevent_hard_delete_client_sites BEFORE DELETE ON public.client_sites FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();

CREATE TRIGGER trg_touch_sites BEFORE UPDATE ON public.client_sites FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER ghg_audit_consent_records AFTER INSERT OR DELETE OR UPDATE ON public.consent_records FOR EACH ROW EXECUTE FUNCTION public.ghg_audit_trigger();

CREATE TRIGGER trg_consent_updated_at BEFORE UPDATE ON public.consent_records FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER ghg_audit_ccpa_requests AFTER INSERT OR DELETE OR UPDATE ON public.consumer_data_requests FOR EACH ROW EXECUTE FUNCTION public.ghg_audit_trigger();

CREATE TRIGGER trg_ccpa_computed BEFORE INSERT OR UPDATE ON public.consumer_data_requests FOR EACH ROW EXECUTE FUNCTION public.compute_ccpa_fields();

CREATE TRIGGER trg_ccpa_updated_at BEFORE UPDATE ON public.consumer_data_requests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER ghg_audit_portability AFTER INSERT OR DELETE OR UPDATE ON public.data_portability_exports FOR EACH ROW EXECUTE FUNCTION public.ghg_audit_trigger();

CREATE TRIGGER trg_portability_computed BEFORE INSERT OR UPDATE ON public.data_portability_exports FOR EACH ROW EXECUTE FUNCTION public.compute_portability_fields();

CREATE TRIGGER trg_portability_updated_at BEFORE UPDATE ON public.data_portability_exports FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER ghg_audit_dsar AFTER INSERT OR DELETE OR UPDATE ON public.data_subject_access_requests FOR EACH ROW EXECUTE FUNCTION public.ghg_audit_trigger();

CREATE TRIGGER trg_dsar_computed BEFORE INSERT OR UPDATE ON public.data_subject_access_requests FOR EACH ROW EXECUTE FUNCTION public.compute_dsar_fields();

CREATE TRIGGER trg_dsar_updated_at BEFORE UPDATE ON public.data_subject_access_requests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_touch_dpdp_erasure_requests BEFORE UPDATE ON public.dpdp_erasure_requests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER ghg_audit_fleet_monthly_logs AFTER INSERT OR DELETE OR UPDATE ON public.fleet_monthly_logs FOR EACH ROW EXECUTE FUNCTION public.ghg_audit_trigger();

CREATE TRIGGER trg_touch_fleet_logs BEFORE UPDATE ON public.fleet_monthly_logs FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_prevent_hard_delete_fleet_vehicles BEFORE DELETE ON public.fleet_vehicles FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();

CREATE TRIGGER trg_touch_fleet BEFORE UPDATE ON public.fleet_vehicles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_touch_framework_disclosures BEFORE UPDATE ON public.framework_disclosures FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_audit_hash_chain BEFORE INSERT ON public.ghg_audit_log FOR EACH ROW EXECUTE FUNCTION public.ghg_audit_hash_chain();

CREATE TRIGGER ghg_audit_ghg_documents AFTER INSERT OR DELETE OR UPDATE ON public.ghg_documents FOR EACH ROW EXECUTE FUNCTION public.ghg_audit_trigger();

CREATE TRIGGER trg_prevent_hard_delete_ghg_emission_source_register BEFORE DELETE ON public.ghg_emission_source_register FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();

CREATE TRIGGER ghg_audit_ghg_hazardous_consumables AFTER INSERT OR DELETE OR UPDATE ON public.ghg_hazardous_consumables FOR EACH ROW EXECUTE FUNCTION public.ghg_audit_trigger();

CREATE TRIGGER trg_touch_hazmat BEFORE UPDATE ON public.ghg_hazardous_consumables FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER ghg_audit_ghg_monthly_readings AFTER INSERT OR DELETE OR UPDATE ON public.ghg_monthly_readings FOR EACH ROW EXECUTE FUNCTION public.ghg_audit_trigger();

CREATE TRIGGER trg_prevent_locked_update BEFORE UPDATE ON public.ghg_monthly_readings FOR EACH ROW EXECUTE FUNCTION public.prevent_locked_update();

CREATE TRIGGER trg_touch_readings BEFORE UPDATE ON public.ghg_monthly_readings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER ghg_audit_ghg_reading_amendments AFTER INSERT OR DELETE OR UPDATE ON public.ghg_reading_amendments FOR EACH ROW EXECUTE FUNCTION public.ghg_audit_trigger();

CREATE TRIGGER ghg_audit_ghg_signoff_chain AFTER INSERT OR DELETE OR UPDATE ON public.ghg_signoff_chain FOR EACH ROW EXECUTE FUNCTION public.ghg_audit_trigger();

CREATE TRIGGER trg_lock_on_submit AFTER UPDATE ON public.ghg_submissions FOR EACH ROW EXECUTE FUNCTION public.lock_readings_on_submission();

CREATE TRIGGER trg_touch_submissions BEFORE UPDATE ON public.ghg_submissions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_touch_verifs BEFORE UPDATE ON public.ghg_verifications FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_leads_spam_protection BEFORE INSERT ON public.leads FOR EACH ROW EXECUTE FUNCTION public.leads_spam_protection();

CREATE TRIGGER trg_mfa_config_updated_at BEFORE UPDATE ON public.mfa_enforcement_config FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_touch_regulatory_filings BEFORE UPDATE ON public.regulatory_filings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_ropa_computed BEFORE INSERT OR UPDATE ON public.ropa_entries FOR EACH ROW EXECUTE FUNCTION public.compute_ropa_fields();

CREATE TRIGGER trg_ropa_updated_at BEFORE UPDATE ON public.ropa_entries FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER ghg_audit_security_incidents AFTER INSERT OR DELETE OR UPDATE ON public.security_incidents FOR EACH ROW EXECUTE FUNCTION public.ghg_audit_trigger();

CREATE TRIGGER trg_incidents_computed BEFORE INSERT OR UPDATE ON public.security_incidents FOR EACH ROW EXECUTE FUNCTION public.compute_incident_fields();

CREATE TRIGGER trg_incidents_updated_at BEFORE UPDATE ON public.security_incidents FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_vendor_computed BEFORE INSERT OR UPDATE ON public.vendor_security_assessments FOR EACH ROW EXECUTE FUNCTION public.compute_vendor_fields();

CREATE TRIGGER trg_vendor_updated_at BEFORE UPDATE ON public.vendor_security_assessments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_touch_webhook_subscriptions BEFORE UPDATE ON public.webhook_subscriptions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


