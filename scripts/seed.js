const postgres = require('postgres');

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('ERROR: DATABASE_URL is not set in environment.');
    process.exit(1);
  }

  console.log('Connecting to Neon PostgreSQL database...');
  const sql = postgres(connectionString, { prepare: false });

  try {
    console.log('Clearing existing KisanLoop demo data...');
    // Delete in reverse foreign key order
    await sql`DELETE FROM audit_logs WHERE 1=1`;
    await sql`DELETE FROM adoption_barriers WHERE 1=1`;
    await sql`DELETE FROM outcomes WHERE 1=1`;
    await sql`DELETE FROM expert_reviews WHERE 1=1`;
    await sql`DELETE FROM actions WHERE 1=1`;
    await sql`DELETE FROM recommendation_evidence WHERE 1=1`;
    await sql`DELETE FROM recommendations WHERE 1=1`;
    await sql`DELETE FROM risk_events WHERE 1=1`;
    await sql`DELETE FROM farm_states WHERE 1=1`;
    await sql`DELETE FROM crops WHERE 1=1`;
    await sql`DELETE FROM fields WHERE 1=1`;
    await sql`DELETE FROM farms WHERE 1=1`;
    await sql`DELETE FROM farmers WHERE 1=1`;
    await sql`DELETE FROM knowledge_documents WHERE 1=1`;
    await sql`DELETE FROM users WHERE id IN ('usr_farmer_ravi', 'usr_farmer_sunita', 'usr_farmer_birsa', 'usr_expert_patel', 'usr_govt_officer', 'usr_admin_master')`;

    console.log('1. Seeding Users...');
    await sql`
      INSERT INTO users (id, email, name, role, preferred_language, created_at) VALUES
      ('usr_farmer_ravi', 'ravi.kumar@kisanloop.org', 'Ravi Kumar (रवि कुमार)', 'FARMER', 'hi', NOW()),
      ('usr_farmer_sunita', 'sunita.devi@kisanloop.org', 'Sunita Devi (सुनीता देवी)', 'FARMER', 'hi', NOW()),
      ('usr_farmer_birsa', 'birsa.munda@kisanloop.org', 'Birsa Munda (बिरसा मुंडा)', 'FARMER', 'hi', NOW()),
      ('usr_expert_patel', 'dr.patel@kvk-ranchi.org', 'Dr. K. Patel (Agronomist)', 'EXPERT', 'en', NOW()),
      ('usr_govt_officer', 'dao.ranchi@jharkhand.gov.in', 'Ramesh Kumar (District Agriculture Officer)', 'GOVT', 'en', NOW()),
      ('usr_admin_master', 'admin@kisanloop.org', 'System Administrator', 'ADMIN', 'en', NOW())
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role
    `;

    console.log('2. Seeding Farmers...');
    await sql`
      INSERT INTO farmers (id, user_id, name, phone, state, district, village, preferred_language, experience_years, created_at) VALUES
      ('frm_ravi', 'usr_farmer_ravi', 'Ravi Kumar', '+919876543210', 'Jharkhand', 'Ranchi', 'Namkum', 'hi', 12, NOW()),
      ('frm_sunita', 'usr_farmer_sunita', 'Sunita Devi', '+919876543211', 'Jharkhand', 'Ranchi', 'Ormanjhi', 'hi', 8, NOW()),
      ('frm_birsa', 'usr_farmer_birsa', 'Birsa Munda', '+919876543212', 'Jharkhand', 'Ranchi', 'Kanke', 'hi', 15, NOW())
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('3. Seeding Farms...');
    await sql`
      INSERT INTO farms (id, farmer_id, name, total_area_acres, latitude, longitude, irrigation_type, soil_type, created_at) VALUES
      ('farm_ravi_01', 'frm_ravi', 'Namkum Farm (Plot 2)', 2.4, 23.3441, 85.3096, 'Rainfed', 'Loamy', NOW()),
      ('farm_sunita_01', 'frm_sunita', 'Ormanjhi Farm', 1.8, 23.4800, 85.4700, 'Borewell', 'Clayey', NOW()),
      ('farm_birsa_01', 'frm_birsa', 'Kanke Farm', 3.1, 23.4300, 85.3200, 'Canal', 'Red Laterite', NOW())
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('4. Seeding Fields (Cadastral 3-Zone system)...');
    await sql`
      INSERT INTO fields (id, farm_id, name, area_acres, boundary_geojson, soil_moisture_percent, created_at) VALUES
      ('fld_ravi_zone_a', 'farm_ravi_01', 'Zone A - Upper Plot', 0.8, '{"type":"Polygon","coordinates":[[[85.3085,23.3435],[85.3095,23.3435],[85.3095,23.3445],[85.3085,23.3445],[85.3085,23.3435]]]}', 42.0, NOW()),
      ('fld_ravi_zone_b', 'farm_ravi_01', 'Zone B - Mid-slope Lowland (Target)', 1.1, '{"type":"Polygon","coordinates":[[[85.3095,23.3435],[85.3110,23.3435],[85.3110,23.3445],[85.3095,23.3445],[85.3095,23.3435]]]}', 78.5, NOW()),
      ('fld_ravi_zone_c', 'farm_ravi_01', 'Zone C - Drainage Basin', 0.5, '{"type":"Polygon","coordinates":[[[85.3110,23.3435],[85.3120,23.3435],[85.3120,23.3445],[85.3110,23.3445],[85.3110,23.3435]]]}', 86.0, NOW())
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('5. Seeding Crops...');
    await sql`
      INSERT INTO crops (id, field_id, name, variety, stage, sowing_date, status, created_at) VALUES
      ('crp_ravi_paddy', 'fld_ravi_zone_b', 'Paddy', 'IR-64', 'Vegetative', NOW() - INTERVAL '45 days', 'ACTIVE', NOW()),
      ('crp_sunita_paddy', 'fld_ravi_zone_a', 'Paddy', 'Swarna (MTU 7029)', 'Vegetative', NOW() - INTERVAL '40 days', 'ACTIVE', NOW())
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('6. Seeding Farm States...');
    await sql`
      INSERT INTO farm_states (id, farm_id, crop_id, crop_name, crop_stage, soil_moisture, rain_risk, heat_risk, pest_risk, disease_risk, overall_risk, summary, updated_at) VALUES
      ('fst_ravi_01', 'farm_ravi_01', 'crp_ravi_paddy', 'Paddy (IR-64)', 'Vegetative (Tillering)', 'adequate', 'high', 'low', 'moderate', 'moderate', 'high', 'Heavy rain (38mm, 85% probability) forecast in next 24h. Zone B soil moisture is already high (78.5%). Suspend supplemental irrigation to prevent root hypoxia.', NOW())
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('7. Seeding Risk Events...');
    await sql`
      INSERT INTO risk_events (id, farm_id, title, description, risk_type, severity, status, created_at) VALUES
      ('rsk_rain_ravi', 'farm_ravi_01', 'Heavy Rainfall & Waterlogging Alert', 'IMD Doppler radar indicates 38mm precipitation within 24h in Namkum block.', 'WEATHER', 'HIGH', 'ACTIVE', NOW()),
      ('rsk_blast_ravi', 'farm_ravi_01', 'Leaf Blast Microclimate Spore Trigger', 'Relative humidity >85% and night temp 22C favor Magnaporthe oryzae sporulation.', 'DISEASE', 'MEDIUM', 'ACTIVE', NOW())
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('8. Seeding Recommendations & Evidence...');
    await sql`
      INSERT INTO recommendations (id, farm_id, crop_id, risk_event_id, title, reason, action_summary, deadline, confidence_score, risk_level, requires_expert_review, is_feasible, alternative_action, status, created_at) VALUES
      ('rec_ravi_irrigation_hold', 'farm_ravi_01', 'crp_ravi_paddy', 'rsk_rain_ravi', 'Suspend Supplemental Irrigation & Open Field Bund Drainage', 'Radar predicts 38mm precipitation. Soil is currently at 78.5% capacity. Irrigation will leach nitrogen fertilizer and trigger root aeration deficit.', 'Turn off borewell pump today and ensure drainage trenches at Zone B edge are clear of paddy straw.', NOW() + INTERVAL '24 hours', 0.94, 'high', false, true, NULL, 'ACTIVE', NOW()),
      ('rec_ravi_blast_bio', 'farm_ravi_01', 'crp_ravi_paddy', 'rsk_blast_ravi', 'Early Vegetative Blast Intervention (Pseudomonas fluorescens 2.5 kg/ha)', 'Computer vision detected spindle-shaped necrotic lesions (82% confidence) in Zone B with high humidity conducive to fungal spread.', 'Spray bio-control agent Pseudomonas fluorescens (2.5 kg/ha) mixed in 500L water during morning dry window.', NOW() + INTERVAL '48 hours', 0.82, 'moderate', true, false, 'Alternative: Hand-weed affected spots and maintain 5cm shallow water depth.', 'ACTIVE', NOW())
      ON CONFLICT (id) DO NOTHING
    `;

    await sql`
      INSERT INTO recommendation_evidence (id, recommendation_id, evidence_type, title, details, source_document_id, created_at) VALUES
      ('ev_weather_01', 'rec_ravi_irrigation_hold', 'WEATHER', 'IMD Doppler Radar Alert', '38mm heavy rainfall predicted in Ranchi division with 85% probability within next 24 hours.', NULL, NOW()),
      ('ev_soil_01', 'rec_ravi_irrigation_hold', 'SOIL', 'Capacitive Soil Probe Telemetry', 'Zone B volumetric soil moisture is currently 78.5%, well above field capacity of 65%.', NULL, NOW()),
      ('ev_rag_01', 'rec_ravi_irrigation_hold', 'KNOWLEDGE_DOC', 'ICAR Kharif Rice Protocol (Sec 4.2)', 'Hold irrigation when soil moisture exceeds 70% and forecasted precipitation is >30mm.', 'kdoc_icar_paddy_2024', NOW()),
      ('ev_vision_01', 'rec_ravi_blast_bio', 'VISION', 'Leaf Lesion Computer Vision Model', 'Spindle-shaped diamond lesions with grey centers identified on upper leaves (82% confidence).', NULL, NOW()),
      ('ev_rag_02', 'rec_ravi_blast_bio', 'KNOWLEDGE_DOC', 'Jharkhand IPM SOP (Paddy Blast)', 'Bio-control Pseudomonas fluorescens recommended before chemical triazole fungicides.', 'kdoc_pest_mgmt_jh', NOW())
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('9. Seeding Actions & Adoption Barriers...');
    await sql`
      INSERT INTO actions (id, recommendation_id, farmer_id, farm_id, title, description, deadline, status, completed_at, notes, created_at) VALUES
      ('act_ravi_irrigation', 'rec_ravi_irrigation_hold', 'frm_ravi', 'farm_ravi_01', 'Hold Irrigation & Inspect Zone B Outlets', 'Keep borewell pump switched off and check drainage channels.', NOW() + INTERVAL '24 hours', 'COMPLETED', NOW() - INTERVAL '2 hours', 'Completed by farmer via one-touch voice confirmation.', NOW()),
      ('act_ravi_biofungicide', 'rec_ravi_blast_bio', 'frm_ravi', 'farm_ravi_01', 'Procure & Apply Pseudomonas fluorescens Spray', 'Obtain 2.5 kg bio-formulation from local PACS center and spray.', NOW() + INTERVAL '48 hours', 'NOT_POSSIBLE', NULL, 'Farmer reported: Formulation out of stock at Namkum PACS.', NOW())
      ON CONFLICT (id) DO NOTHING
    `;

    await sql`
      INSERT INTO adoption_barriers (id, action_id, farmer_id, barrier_type, notes, reported_at) VALUES
      ('bar_ravi_01', 'act_ravi_biofungicide', 'frm_ravi', 'INPUT_UNAVAILABLE', 'Pseudomonas fluorescens biological formulation is out of stock at Namkum PACS center.', NOW())
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('10. Seeding Expert Reviews...');
    await sql`
      INSERT INTO expert_reviews (id, recommendation_id, expert_id, status, expert_notes, correction_details, reviewed_at, created_at) VALUES
      ('rev_ravi_blast_01', 'rec_ravi_blast_bio', 'usr_expert_patel', 'PENDING', NULL, NULL, NULL, NOW() - INTERVAL '3 hours')
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('11. Seeding Outcomes...');
    await sql`
      INSERT INTO outcomes (id, action_id, farm_id, crop_id, before_state, after_state, yield_impact, cost_savings_inr, water_saved_liters, expert_validated, expert_validation_notes, recorded_at) VALUES
      ('out_ravi_01', 'act_ravi_irrigation', 'farm_ravi_01', 'crp_ravi_paddy', 'Pre-monsoon soil moisture 78.5% with rain imminent.', 'Avoided unnecessary pumping. Preserved nitrogen from leaching. Bund drains cleared.', '+8% yield preservation', 650.0, 12000.0, true, 'Verified via drone NDVI and ground sensor telemetry.', NOW())
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('12. Seeding Knowledge Documents...');
    await sql`
      INSERT INTO knowledge_documents (id, title, filename, file_type, storage_key, file_size_bytes, chunk_count, status, created_at) VALUES
      ('kdoc_icar_paddy_2024', 'ICAR Package of Practices for Kharif Rice (Jharkhand)', 'ICAR_Kharif_Rice_2024.pdf', 'PDF', 'knowledge/icar_kharif_rice_2024.pdf', 2457600, 18, 'READY', NOW()),
      ('kdoc_pest_mgmt_jh', 'Jharkhand Integrated Pest Management SOP (Paddy Blast)', 'Jharkhand_IPM_Blast_SOP.docx', 'DOCX', 'knowledge/jharkhand_ipm_blast.docx', 1228800, 12, 'READY', NOW())
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('=== Neon PostgreSQL Database Seeding Complete! ===');
    await sql.end();
  } catch (err) {
    console.error('Seeding failed:', err);
    await sql.end();
    process.exit(1);
  }
}

seed();
