const jsonContent = (schemaRef: string) => ({
  "application/json": {
    schema: { $ref: schemaRef }
  }
});

const requestBody = (schemaRef: string) => ({
  required: true,
  content: jsonContent(schemaRef)
});

const response = (description: string, schemaRef: string) => ({
  description,
  content: jsonContent(schemaRef)
});

const pathParam = (name: string) => ({
  name,
  in: "path",
  required: true,
  schema: { type: "string" }
});

const queryParam = (name: string, example?: string) => ({
  name,
  in: "query",
  required: true,
  schema: { type: "string", ...(example && { example }) }
});

export const openApiDocument = {
  openapi: "3.0.3",

  info: {
    title: "Mini Fintech API",
    version: "1.0.0",
    description:
      "API para processamento de transacoes financeiras com arquitetura hexagonal"
  },

  servers: [
    {
      url: "/api",
      description: "Base path local"
    }
  ],

  tags: [
    { name: "Users" },
    { name: "Cards" },
    { name: "Transactions" },
    { name: "Invoices" }
  ],

  components: {
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "VALIDATION_ERROR" },
              message: { type: "string", example: "Invalid input" }
            },
            required: ["code", "message"]
          }
        },
        required: ["error"]
      },

      CreateUserRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "Alice" },
          email: { type: "string", format: "email", example: "alice@mail.com" },
          password: { type: "string", minLength: 8, example: "12345678" }
        },
        required: ["name", "email", "password"]
      },

      UserResponse: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          createdAt: { type: "string", format: "date-time" }
        },
        required: ["id", "name", "email", "createdAt"]
      },

      CreateCardRequest: {
        type: "object",
        properties: {
          userId: { type: "string", example: "user-id" },
          cardNumber: {
            type: "string",
            pattern: "^\\d{16}$",
            example: "1234123412341234"
          },
          limitCents: { type: "integer", minimum: 100, example: 500000 }
        },
        required: ["userId", "cardNumber", "limitCents"]
      },

      CardResponse: {
        type: "object",
        properties: {
          id: { type: "string" },
          userId: { type: "string" },
          last4: { type: "string", example: "1234" },
          limitCents: { type: "integer" },
          availableLimitCents: { type: "integer" },
          status: { type: "string", enum: ["ACTIVE", "BLOCKED"] },
          createdAt: { type: "string", format: "date-time" }
        },
        required: [
          "id",
          "userId",
          "last4",
          "limitCents",
          "availableLimitCents",
          "status",
          "createdAt"
        ]
      },

      ProcessTransactionRequest: {
        type: "object",
        properties: {
          userId: { type: "string", example: "user-id" },
          cardId: { type: "string", example: "card-id" },
          amountCents: { type: "integer", minimum: 1, example: 10000 },
          description: { type: "string", example: "Compra mercado" }
        },
        required: ["userId", "cardId", "amountCents", "description"]
      },

      TransactionResponse: {
        type: "object",
        properties: {
          id: { type: "string" },
          cardId: { type: "string" },
          userId: { type: "string" },
          amountCents: { type: "integer" },
          description: { type: "string" },
          status: {
            type: "string",
            enum: ["PENDING", "APPROVED", "DECLINED", "CANCELLED", "CHARGEBACK"]
          },
          referenceMonth: { type: "string", example: "2026-03" },
          createdAt: { type: "string", format: "date-time" },
          cancelledAt: { type: "string", format: "date-time", nullable: true },
          chargebackAt: { type: "string", format: "date-time", nullable: true }
        },
        required: [
          "id",
          "cardId",
          "userId",
          "amountCents",
          "description",
          "status",
          "referenceMonth",
          "createdAt"
        ]
      },

      InvoiceResponse: {
        type: "object",
        properties: {
          id: { type: "string" },
          cardId: { type: "string" },
          userId: { type: "string" },
          referenceMonth: { type: "string", example: "2026-03" },
          totalCents: { type: "integer" },
          transactionIds: { type: "array", items: { type: "string" } },
          generatedAt: { type: "string", format: "date-time" }
        },
        required: [
          "id",
          "cardId",
          "userId",
          "referenceMonth",
          "totalCents",
          "transactionIds",
          "generatedAt"
        ]
      }
    }
  },

  paths: {
    "/users": {
      post: {
        tags: ["Users"],
        summary: "Criar usuario",
        requestBody: requestBody("#/components/schemas/CreateUserRequest"),
        responses: {
          "201": response(
            "Usuario criado",
            "#/components/schemas/UserResponse"
          ),
          "400": response(
            "Erro de validacao",
            "#/components/schemas/ErrorResponse"
          )
        }
      }
    },

    "/cards": {
      post: {
        tags: ["Cards"],
        summary: "Criar cartao",
        requestBody: requestBody("#/components/schemas/CreateCardRequest"),
        responses: {
          "201": response("Cartao criado", "#/components/schemas/CardResponse"),
          "404": response(
            "Usuario nao encontrado",
            "#/components/schemas/ErrorResponse"
          )
        }
      }
    },

    "/transactions": {
      post: {
        tags: ["Transactions"],
        summary: "Processar transacao",
        requestBody: requestBody(
          "#/components/schemas/ProcessTransactionRequest"
        ),
        responses: {
          "201": response(
            "Transacao processada",
            "#/components/schemas/TransactionResponse"
          )
        }
      }
    },

    "/transactions/{transactionId}/cancel": {
      post: {
        tags: ["Transactions"],
        summary: "Cancelar transacao",
        parameters: [pathParam("transactionId")],
        responses: {
          "200": response(
            "Transacao cancelada",
            "#/components/schemas/TransactionResponse"
          )
        }
      }
    },

    "/transactions/{transactionId}/chargeback": {
      post: {
        tags: ["Transactions"],
        summary: "Simular chargeback",
        parameters: [pathParam("transactionId")],
        responses: {
          "200": response(
            "Chargeback aplicado",
            "#/components/schemas/TransactionResponse"
          )
        }
      }
    },

    "/cards/{cardId}/invoice": {
      get: {
        tags: ["Invoices"],
        summary: "Gerar ou consultar fatura mensal",
        parameters: [
          pathParam("cardId"),
          queryParam("referenceMonth", "2026-03")
        ],
        responses: {
          "200": response(
            "Fatura do mes",
            "#/components/schemas/InvoiceResponse"
          )
        }
      }
    }
  }
} as const;