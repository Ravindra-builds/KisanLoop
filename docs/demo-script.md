# KisanLoop: Live Demonstration Script (Hero Pilot Walkthrough)

**Hero Farmer**: Ravi Kumar  
**Location**: Namkum, Ranchi, Jharkhand  
**Plot**: 1.2 Acres Paddy (IR-64), Vegetative Stage  
**Constraint**: Smallholder, limited irrigation, Hindi speaking  

---

### Step 1: Open KisanLoop (Farmer Experience)
1. Navigate to `/` (or click **Farmer Portal** in top navigation).
2. **Observe**:
   - Personalized greeting: *"नमस्ते, रवि कुमार 👋"*
   - Vital Signal Badges:
     - 🌱 Crop Health: Good (NDVI 0.72)
     - 💧 Soil Moisture: Adequate (68.5%)
     - 🌧 Weather Risk: High (85% Rain Tomorrow, 42mm)
     - 🐛 Pest Risk: Moderate
3. **Hero Recommendation ("Today's Action")**:
   - *"Hold Irrigation Today (आज सिंचाई न करें)"*
   - Explanation: *"Rain is expected tomorrow. Field already has enough moisture (68.5%). Don't irrigate today."*
4. **Voice Audio (Listen Button)**:
   - Click **"सुनें (Listen)"** -> Voice speaks advice cleanly in Hindi.
5. **Action Verification**:
   - Click **"कर लिया (Done)"** -> Action is immediately registered as completed in the database and audit trail.

---

### Step 2: Adoption Barrier Tracking (The Last Mile Problem)
1. Scroll to the second recommendation: *"Apply Bio-Fungicide or Neem Extract"*.
2. Click **"यह नहीं कर सके (I couldn't do this)"**.
3. **Adoption Barrier Modal pops up**:
   - Select reason: *"स्थानीय दुकान में दवा / खाद उपलब्ध नहीं है (Agri-input unavailable locally)"*.
   - Click **"बाधा दर्ज करें (Submit Barrier)"**.
4. **Result**: The barrier is captured into the system, directly updating regional government supply chain intelligence.

---

### Step 3: Crop Health & AI Vision Diagnosis
1. Under **"फसल रोग पहचान (AI Vision Diagnosis)"**:
   - Click **"तस्वीर की जांच करें (Scan Leaf Sample)"**.
2. **Perception**:
   - System analyzes spindle-shaped lesions.
   - Result: *Paddy Leaf Blast (धान का झुलसा रोग)* detected with 78% confidence.
   - **Feasibility Check**: Flags that commercial fungicide is often out of stock; provides feasible local alternative (Neem Seed Kernel Extract NSKE 5%).
   - **Safety Policy**: Because confidence is 78% (<85%), the case is automatically escalated to KVK expert review.

---

### Step 4: Traceability via Recommendation Passport
1. Click **"सिफारिश पासपोर्ट (Passport)"**.
2. **Observe**:
   - What was recommended.
   - Why it was recommended.
   - Exact telemetry considered (IMD radar probability, Soil sensor moisture, ICAR guidelines).
   - Farmer action status and outcome metrics.

---

### Step 5: Agricultural Expert Verification
1. Click **"कृषि विशेषज्ञ (Expert)"** in the top navigation.
2. Logged in as: **Dr. K. Patel (Senior Agronomist, KVK Ranchi)**.
3. Select Ravi Kumar's escalated case from the queue.
4. Inspect AI reasoning and knowledge citations.
5. In the decision box, enter note: *"Approved with alternate organic formulation (NSKE 5%) to bypass local stock-out."*
6. Click **"Approve Recommendation"**.

---

### Step 6: Government & Extension Dashboard
1. Click **"सरकारी / प्रसार डैशबोर्ड (Govt)"** in top navigation.
2. View high-level regional indicators:
   - **Actionable Advisory Rate**: **74%**
   - **Farmer Adoption Rate**: **82%**
   - **Water Saved**: **24 Lakh Liters**
   - **Money Saved**: **₹1.85 Lakh**
3. Inspect the **Adoption Funnel Chart** (Recharts): Intelligence Delivered -> Feasibility Validated -> Actions Accepted -> Actions Completed -> Verified Outcomes.
4. Inspect the **Adoption Barrier Analysis Chart**: Real-time breakdown showing *Input Unavailable (38%)* as the #1 obstacle in Ranchi district.
5. Inspect the **Interactive GIS Map**: Ravi Kumar's field pinpointed with heavy rainfall risk contour.

---

### Step 7: Knowledge & Dataset Center
1. Click **"ज्ञान एवं डेटा केंद्र (Knowledge & Data)"** in top navigation.
2. View parsed research documents stored in Qdrant Vector Index.
3. Test uploading a new agricultural guideline or CSV dataset with interactive column mapping.
