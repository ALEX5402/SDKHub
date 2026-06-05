import { jsonResponse, handleOptions } from "@/lib/api-response";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  const spec = {
    openapi: "3.0.0",
    info: {
      title: "Web SDK Manager API",
      description: "API for fetching, querying, and downloading Android SDK, NDK, and CMake version packages.",
      version: "1.0.0",
    },
    servers: [
      {
        url: "/api",
        description: "Local API base path",
      },
    ],
    paths: {
      "/tools": {
        get: {
          summary: "List available SDK tools/packages",
          description: "Retrieve all tools with optional filtering by type/name, OS, version, and architecture. Paginated.",
          parameters: [
            {
              name: "name",
              in: "query",
              required: false,
              description: "Filter by category name (e.g. ndk, cmake, build-tools, platform-tools)",
              schema: { type: "string" },
            },
            {
              name: "version",
              in: "query",
              required: false,
              description: "Filter by exact version number",
              schema: { type: "string" },
            },
            {
              name: "os",
              in: "query",
              required: false,
              description: "Filter by OS compatibility (windows, macosx, linux)",
              schema: { type: "string" },
            },
            {
              name: "arch",
              in: "query",
              required: false,
              description: "Filter by target CPU architecture (x86_64, arm64, x86)",
              schema: { type: "string" },
            },
            {
              name: "page",
              in: "query",
              required: false,
              description: "Page index (starts at 1)",
              schema: { type: "integer", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              required: false,
              description: "Items per page (max 100)",
              schema: { type: "integer", default: 20 },
            },
          ],
          responses: {
            "200": {
              description: "Success",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            version: { type: "string" },
                            os: { type: "string" },
                            arch: { type: "string" },
                            downloadUrl: { type: "string" },
                            checksum: { type: "string" },
                            sizeBytes: { type: "integer" },
                            lastUpdated: { type: "string", format: "date-time" },
                          },
                        },
                      },
                      pagination: {
                        type: "object",
                        properties: {
                          page: { type: "integer" },
                          limit: { type: "integer" },
                          total: { type: "integer" },
                          totalPages: { type: "integer" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/tools/versions": {
        get: {
          summary: "Get available versions of a tool",
          description: "List all unique versions available for a tool by name, optionally filtered by platform and architecture.",
          parameters: [
            {
              name: "name",
              in: "query",
              required: true,
              description: "Filter by category name (e.g. ndk, cmake)",
              schema: { type: "string" },
            },
            {
              name: "os",
              in: "query",
              required: false,
              description: "Filter by OS target",
              schema: { type: "string" },
            },
            {
              name: "arch",
              in: "query",
              required: false,
              description: "Filter by CPU arch",
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Success",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      name: { type: "string" },
                      versions: {
                        type: "array",
                        items: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad request - name parameter is missing",
            },
          },
        },
      },
      "/tools/download": {
        get: {
          summary: "Download a tool",
          description: "Logs the download statistics and redirects the client to the raw Google CDN zip package.",
          parameters: [
            {
              name: "name",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "version",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "os",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "arch",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "302": {
              description: "Temporary Redirect to official zipball URL",
            },
            "400": {
              description: "Missing parameters",
            },
            "404": {
              description: "Matching tool package version not found",
            },
          },
        },
      },
      "/stats": {
        get: {
          summary: "Get download metrics & telemetry summary",
          description: "Returns aggregated statistics counts grouped by name, operating system, cpu arch, and daily download frequency.",
          responses: {
            "200": {
              description: "Success",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: {
                        type: "object",
                        properties: {
                          totalDownloads: { type: "integer" },
                          topTools: { type: "array" },
                          osBreakdown: { type: "array" },
                          archBreakdown: { type: "array" },
                          trends: { type: "array" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/admin/sync": {
        post: {
          summary: "Manually force sync repositories",
          description: "Triggers worker to fetch index feeds from Google CDN and update database records. Protected by Bearer token or username/password body credentials.",
          security: [
            {
              bearerAuth: [],
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    username: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Sync ran successfully",
            },
            "401": {
              description: "Unauthorized credentials",
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
        },
      },
    },
  };

  return jsonResponse(spec);
}
