#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  UBIK2 YEMG MVP - Marketplace SaaS para MiPymes cubanas/LATAM (Fase 1).
  Funcionalidades núcleo: auth, publicar productos, marketplace público con búsqueda y categorías,
  WhatsApp directo, dashboard usuario con planes Básico/Premium, suscripciones manuales.
  Stack adaptado: Next.js 15 + MongoDB (en lugar de Postgres/Prisma).

backend:
  - task: "Health/Categories/Stats endpoints"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "GET /api/ returns ok, GET /api/categories returns 8 categories, GET /api/stats returns counts."
      - working: true
        agent: "testing"
        comment: "✅ All endpoints tested successfully. Health returns {ok: true, app: 'UBIK2 YEMG API', version: '1.0'}. Categories returns 8 categories with id/name/icon. Stats returns productsCount: 32, businessesCount: 10, usersCount: 0."

  - task: "Seed endpoint"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "POST /api/seed inserts demo businesses+products if empty, idempotent."
      - working: true
        agent: "testing"
        comment: "✅ Seed endpoint working correctly. Returns 'Ya hay datos cargados' when data already exists (idempotent behavior confirmed)."

  - task: "Auth register/login/me with JWT"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "POST /api/auth/register creates user+business and returns JWT. POST /api/auth/login validates with bcrypt. GET /api/auth/me returns current user+business. Token via Authorization: Bearer."
      - working: true
        agent: "testing"
        comment: "✅ All auth endpoints working perfectly. Register creates user+business with JWT token. Duplicate email correctly rejected (400). Login validates credentials with bcrypt. Wrong password correctly rejected (401). GET /api/auth/me returns user+business with Bearer token. No token correctly rejected (401)."

  - task: "Products CRUD with plan limit"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "GET /api/products supports q, category, featured, businessId filters. POST/PUT/DELETE require auth. Basico plan limited to 10 products. Featured only allowed for premium."
      - working: true
        agent: "testing"
        comment: "✅ All CRUD operations working correctly. POST without auth rejected (401). POST with auth creates product with businessId. PUT updates product price. PUT on non-owned product rejected (403). DELETE removes product. Plan limits enforced: basico plan allows 10 products, 11th rejected with 403 'Límite del plan Básico (10 productos) alcanzado'. Featured=true with basico plan correctly forced to false. After upgrade to premium, featured=true works correctly."

  - task: "Products listing enriched with business"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Listing attaches business object to each product. GET /api/products/:id also includes business."
      - working: true
        agent: "testing"
        comment: "✅ Products listing working perfectly. GET /api/products returns 32 products, each with business object attached. Search with ?q=mojito finds 'Mojito Cubano'. Filter ?category=comida returns 8 products all in 'comida' category. Filter ?featured=true returns 12 featured products. GET /api/products/:id returns product with business object. Invalid ID correctly returns 404."

  - task: "My products & Business detail"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "GET /api/my/products auth-only returns current user's products. GET /api/businesses/:id returns business + its products. PUT /api/businesses/:id allows owner to update business profile."
      - working: true
        agent: "testing"
        comment: "✅ All endpoints working correctly. GET /api/my/products with auth returns user's products only. GET /api/businesses/:id returns business with 11 products array. PUT /api/businesses/:id with auth updates own business description successfully. PUT on other business correctly rejected with 403 'Sin permiso'."

  - task: "Subscription request (USDC/Transfermóvil)"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "POST /api/subscription creates pending payment record for admin approval."
      - working: true
        agent: "testing"
        comment: "✅ Subscription endpoint working correctly. POST /api/subscription with auth creates payment record with status='pending', plan='premium', paymentMethod='usdc', and reference. Returns payment object and confirmation message."

frontend:
  - task: "Marketplace home (hero, categories, featured, products grid)"
    implemented: true
    working: "NA"
    file: "/app/app/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Glassmorphism futurista, dark mode forzado, gradientes purple/fuchsia. Verificado por screenshot."

  - task: "Auth flows (login/register modal)"
    implemented: true
    working: "NA"
    file: "/app/app/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Dialog con tabs entrar/registrar. Token guardado en localStorage."

  - task: "Product detail with WhatsApp button"
    implemented: true
    working: "NA"
    file: "/app/app/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Genera link wa.me con mensaje predefinido en español."

  - task: "User dashboard (CRUD productos + plan)"
    implemented: true
    working: "NA"
    file: "/app/app/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Lista productos del negocio, modal de crear/editar, eliminar, modal de upgrade Premium."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 1
  run_ui: false

test_plan:
  current_focus: []
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: |
      MVP Fase A construido. Backend Next.js API en /app/app/api/[[...path]]/route.js usando MongoDB.
      Por favor probar todos los endpoints listados. Datos de seed ya cargados (ver count > 0).
      Notas:
      - Seed es idempotente (devuelve mensaje cuando ya hay datos).
      - Para probar plan limit: crear usuario nuevo, crear 10 productos, el 11º debe devolver 403.
      - Para probar `featured` con plan básico, el campo debe forzarse a false.
      - WhatsApp link es solo frontend (no testear).
      - DB: ubik2_yemg en MongoDB local. Base URL: usar NEXT_PUBLIC_BASE_URL + /api.
  - agent: "testing"
    message: |
      ✅ BACKEND TESTING COMPLETE - ALL TESTS PASSED (30/30)
      
      Comprehensive backend testing completed successfully. All 7 backend tasks tested and verified working:
      
      1. Health/Categories/Stats endpoints - ✅ Working
      2. Seed endpoint - ✅ Working (idempotent)
      3. Auth register/login/me with JWT - ✅ Working (all flows including error cases)
      4. Products CRUD with plan limit - ✅ Working (auth, ownership, plan limits enforced)
      5. Products listing enriched with business - ✅ Working (filters, search, business attached)
      6. My products & Business detail - ✅ Working (auth-only, ownership checks)
      7. Subscription request - ✅ Working (creates pending payment)
      
      Key validations:
      - All authentication flows working (register, login, me, token validation)
      - Plan limits correctly enforced (basico=10 products, 11th rejected)
      - Featured products only allowed for premium users
      - Ownership checks working for products and businesses
      - All filters working (search, category, featured, businessId)
      - Business objects correctly attached to products
      - Seed data idempotent (returns "Ya hay datos cargados")
      
      No critical issues found. Backend is production-ready.
