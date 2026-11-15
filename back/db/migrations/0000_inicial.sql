CREATE TABLE "productores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" varchar(120) NOT NULL,
	"localidad" varchar(120) NOT NULL,
	"descripcion" text DEFAULT '' NOT NULL,
	"foto_url" varchar(500),
	"creado" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parcelas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"productor_id" uuid NOT NULL,
	"nombre" varchar(80) NOT NULL,
	"geometria" jsonb NOT NULL,
	"creada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "producciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"codigo" varchar(20) NOT NULL,
	"parcela_id" uuid NOT NULL,
	"especie" varchar(120) NOT NULL,
	"nombre_cientifico" varchar(160) NOT NULL,
	"familia" varchar(60),
	"nombre_familia" varchar(80),
	"cultivar" varchar(160) NOT NULL,
	"numero_inase" varchar(20),
	"fecha_siembra" date NOT NULL,
	"fecha_cosecha" date,
	"kg_cosechados" double precision,
	"creada" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "producciones_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "eventos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parcela_id" uuid NOT NULL,
	"produccion_id" uuid,
	"tipo" varchar(30) NOT NULL,
	"fecha" date NOT NULL,
	"cultivo" jsonb,
	"detalles" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"notas" text DEFAULT '' NOT NULL,
	"foto_url" varchar(500),
	"foto_credito" jsonb,
	"registrado" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "parcelas" ADD CONSTRAINT "parcelas_productor_id_productores_id_fk" FOREIGN KEY ("productor_id") REFERENCES "public"."productores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "producciones" ADD CONSTRAINT "producciones_parcela_id_parcelas_id_fk" FOREIGN KEY ("parcela_id") REFERENCES "public"."parcelas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_parcela_id_parcelas_id_fk" FOREIGN KEY ("parcela_id") REFERENCES "public"."parcelas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_produccion_id_producciones_id_fk" FOREIGN KEY ("produccion_id") REFERENCES "public"."producciones"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "eventos_parcela_idx" ON "eventos" USING btree ("parcela_id");--> statement-breakpoint
CREATE INDEX "eventos_produccion_idx" ON "eventos" USING btree ("produccion_id");