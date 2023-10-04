import Fastify, { FastifyInstance, RouteShorthandOptions } from "fastify";
import { Server, IncomingMessage, ServerResponse } from "http";
import { productSchemas } from "./modules/product/product.schema";
import swagger from "@fastify/swagger";
import swaggerui from "@fastify/swagger-ui";
import { version } from "../package.json";
import productRoutes from "./modules/product/product.route";

const server: FastifyInstance = Fastify({});

const opts: RouteShorthandOptions = {
	schema: {
		response: {
			200: {
				type: "object",
				properties: {
					pong: {
						type: "string",
					},
				},
			},
		},
	},
};

server.get("/ping", opts, async (request, reply) => {
	return { pong: "it worked!" };
});

const start = async () => {
	// schemas
	for (const schema of [...productSchemas]) {
		server.addSchema(schema);
	}

	await server.register(swagger, {
		openapi: {
			info: {
				title: "Fastify API",
				description: "PostgreSQL, Prisma, Fastify and Swagger REST API",
				version: version,
			},
			externalDocs: {
				url: "https://swagger.io",
				description: "Find more info here",
			},
			servers: [{ url: "http://localhost:3001" }],
			components: {
				securitySchemes: {
					apiKey: {
						type: "apiKey",
						name: "apiKey",
						in: "header",
					},
				},
			},
			security: [{ apiKey: [] }],
		},
	});

  await server.register(swaggerui, {
    routePrefix: "/docs",
    initOAuth: {},
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

	// routes
	server.register(productRoutes, { prefix: "api/products" });

	try {
		await server.listen({ port: 3000 });

		const address = server.server.address();
		const port = typeof address === "string" ? address : address?.port;
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

start();
