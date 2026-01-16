ระบบบริหารจัดการ “ร้านคอมพิวเตอร์ + งานซ่อม + จำหน่าย/ติดตั้งกล้องวงจรปิด + ซัพพอร์ตระยะไกล” แบบใช้งานจริง ครบทั้ง Frontend/Backend/DB/Deploy

บริบทจากป้ายร้าน:
- ชื่อร้าน: อาคมคอมพิวเตอร์
- พื้นที่: เชียงคำ
- โทร: 054-452645
- บริการ: ศูนย์บริการคอมพิวเตอร์/กล้องวงจรปิด, จำหน่าย, ซ่อม, โน้ตบุ๊ค, คอมพิวเตอร์
- มีบริการหลังการขาย และงานติดตั้งกล้องวงจรปิดพร้อมบริการ

ลิงก์อ้างอิงแบรนด์/เพจ (ใช้เป็นข้อมูลประกอบ UI/Brand เท่านั้น ห้ามดึงข้อมูลส่วนตัว):
- https://facebook.com/tuuuum

เป้าหมายระบบ:
1) ใช้งานได้จริงในร้าน (Desktop/Tablet/Mobile)
2) มีหลังบ้าน Admin + หน้าพนักงาน/ช่าง + พอร์ทัลลูกค้า
3) มี QR สำหรับติดตามงาน/สแกนสินค้า/สแกนหน้างาน/ชำระเงิน
4) มีโมดูลซัพพอร์ตระยะไกล “แบบถูกต้อง” (ขอความยินยอม + Token ชั่วคราว + Audit log)

ข้อกำหนดสแตก (เลือกและทำให้ครบ):
- Monorepo: pnpm + Turborepo
- Frontend: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- Backend: NestJS + TypeScript + Prisma
- DB: PostgreSQL
- Cache/Queue: Redis (BullMQ)
- Auth: JWT + Refresh Token + RBAC (Owner/Admin/Staff/Technician/Accountant/Customer)
- Realtime: WebSocket (แจ้งเตือนสถานะงานซ่อม/ช่าง)
- Files: Upload รูป/เอกสาร (local dev: filesystem, prod: S3-compatible)
- Deploy: Docker Compose (dev) + production-ready Dockerfiles
- Logging/Audit: structured logs + audit trail table
- Tests: unit + integration (ขั้นต่ำ), seed data, migration scripts

ขอบเขตฟีเจอร์ (ต้องทำครบอย่างน้อย MVP+):
A) ลูกค้า/CRM
- ลูกค้า: โปรไฟล์, ประวัติการซ่อม/ซื้อ, ที่อยู่, เลขผู้เสียภาษี(ถ้ามี)
- สถานะสมาชิก/ระดับลูกค้า, โน้ตภายใน, tag, การรับประกัน

B) สินค้า/สต๊อก/บาร์โค้ด/QR
- สินค้า: หมวดหมู่, ยี่ห้อ, รุ่น, Serial/IMEI (ถ้ามี), ต้นทุน, ราคาขาย, VAT
- สต๊อก: รับเข้า/จ่ายออก/ปรับยอด/นับสต๊อก
- สแกน QR/Barcode: สร้าง/พิมพ์สติ๊กเกอร์
- อะไหล่ผูกกับใบงานซ่อม (ตัดสต๊อกอัตโนมัติ)

C) POS/ขายหน้าร้าน
- ตะกร้าขาย, ส่วนลด, คูปองพื้นฐาน
- ออกใบเสร็จ/ใบกำกับ (อย่างน้อยรูปแบบใบเสร็จ)
- พิมพ์ใบเสร็จ (รองรับ thermal: ผ่าน browser print template)
- ช่องทางชำระ: เงินสด/โอน/QR Payment (บันทึกหลักฐานแนบรูปสลิป)

D) งานซ่อม (Repair Ticketing)
- สร้างใบงาน: อุปกรณ์, อาการเสีย, ประเมินราคา, มัดจำ, ระยะเวลาคาดการณ์
- สถานะ: รับเครื่อง → ตรวจเช็ค → รออะไหล่ → กำลังซ่อม → ทดสอบ → พร้อมรับ → ปิดงาน/ยกเลิก
- แนบรูปก่อน/หลัง, log การทำงาน, ช่างผู้รับผิดชอบ, ค่าแรง/ค่าอะไหล่
- แจ้งเตือนลูกค้า (ในระบบ/อีเมล mock ได้) เมื่อสถานะเปลี่ยน
- QR ใบงาน: ลูกค้าเปิดลิงก์ติดตามสถานะ (Customer Portal แบบไม่ต้องล็อกอินด้วย one-time link หรือ OTP)

E) งานติดตั้งกล้องวงจรปิด/งานภาคสนาม (CCTV/On-site)
- สร้างโปรเจกต์หน้างาน: สถานที่, แบบ, จำนวนกล้อง, อุปกรณ์, ใบเสนอราคา
- นัดหมาย, เช็คอินหน้างานด้วย QR, บันทึกหน้างาน (รูป/บันทึก/พิกัด “optional”)
- ส่งมอบงาน + เอกสาร + ระยะรับประกันงานติดตั้ง

F) ซัพพอร์ตระยะไกล (Remote Support – ต้องปลอดภัย/ยินยอม)
- ออก “Support Session” ให้ลูกค้า: สร้างคำขอ, เหตุผล, ระยะเวลา, ผู้รับผิดชอบ
- สร้าง One-time Token/Code (หมดอายุภายใน X นาที) ให้ลูกค้ากรอกเพื่อยืนยันยินยอม
- เก็บ Audit log ทุกการกระทำในระบบ (สร้าง/เริ่ม/จบ session)
- ระบบ “แนะนำเครื่องมือรีโมท” แบบลิงก์/ขั้นตอน (เช่น AnyDesk/TeamViewer) และบันทึก Session ID ที่ลูกค้าให้มา
- ห้ามทำฟีเจอร์ที่เป็นการเข้าถึงเครื่องลูกค้าโดยไม่ยินยอม หรือหลบเลี่ยงการยืนยันตัวตน

G) การเงินพื้นฐาน
- สรุปรายวัน: ยอดขาย, ยอดซ่อม, มัดจำ, ค้างชำระ
- ลูกหนี้/สถานะชำระ, ใบแจ้งหนี้แบบง่าย
- Export CSV (ยอดขาย/สต๊อก/ใบงาน)

H) ผู้ใช้/สิทธิ์/RBAC
- Owner: ทุกอย่าง
- Admin: จัดการระบบ/พนักงาน
- Staff: POS/รับงานซ่อม
- Technician: งานซ่อม/งานภาคสนาม
- Accountant: รายงานการเงิน
- Customer: ดูสถานะงาน/ประวัติของตัวเอง
- ต้องมี Permission matrix ชัดเจน + middleware guard ฝั่ง backend

I) UI/UX
- โทน “ร้านบริการจริง”: อ่านง่าย, หน้าหลักมีปุ่มลัด (ขาย/รับซ่อม/สแกน/นัดหมาย/งานภาคสนาม)
- Dashboard: วันนี้ต้องทำอะไร, งานค้าง, อะไหล่รอ, ลูกค้ามารับ
- รองรับมือถือสำหรับช่าง (สแกน QR, อัปเดตรูป, เช็คอินหน้างาน)

สิ่งที่ต้องส่งมอบ (Output Format ห้ามข้าม):
PHASE 1: SPEC
1) แผนผังสถาปัตยกรรม (text diagram)
2) ERD/DB schema (ตารางหลัก + ความสัมพันธ์)
3) API list (REST) + WebSocket events
4) Permission matrix
5) User flows สำคัญ (ขาย/รับซ่อม/ติดตั้ง/รีโมท)

PHASE 2: BUILD (โค้ดจริง)
- สร้างโครง monorepo พร้อม package:
  /apps/web (Next.js)
  /apps/api (NestJS)
  /packages/ui (shared components)
  /packages/shared (types/zod schemas)
- Prisma schema + migrations + seed
- Auth + RBAC + audit logs
- CRUD ครบสำหรับโมดูลหลัก
- QR generator + scan UI
- Print templates (ใบเสร็จ/ใบงาน)
- Docker Compose: postgres + redis + api + web
- .env.example ครบ

PHASE 3: TEST
- test plan + ชุดเคสหลัก
- integration tests อย่างน้อย: auth, create repair ticket, stock movement

PHASE 4: OPS
- คู่มือรัน local + deploy
- backup/restore db scripts
- monitoring checklist (logs, db, queue)

ข้อจำกัดสำคัญ:
- ห้ามเดาข้อมูลภาษี/กฎหมายเฉพาะพื้นที่ ให้ทำเป็น field/config เฉยๆ
- ห้ามทำเครื่องมือเชิงเจาะระบบ/แอบรีโมท/บังคับควบคุมเครื่องลูกค้า
- ทุกอย่างต้องตรวจสอบย้อนกลับได้ (audit trail)
