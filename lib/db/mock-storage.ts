// In-memory / Fallback DB Store for DEMO_MODE
// Seeded for Hero Farmer Ravi Kumar (Namkum, Ranchi, Jharkhand)

export interface MockStore {
  users: any[];
  farmers: any[];
  farms: any[];
  fields: any[];
  crops: any[];
  farmStates: any[];
  weatherObservations: any[];
  soilObservations: any[];
  satelliteObservations: any[];
  pestObservations: any[];
  riskEvents: any[];
  recommendations: any[];
  recommendationEvidence: any[];
  actions: any[];
  adoptionBarriers: any[];
  outcomes: any[];
  expertReviews: any[];
  knowledgeDocuments: any[];
  datasets: any[];
  auditLogs: any[];
}

export function createInitialSeed(): MockStore {
  const users = [
    {
      id: "usr_farmer_ravi",
      name: "Ravi Kumar",
      email: "ravi.kumar@kisanloop.org",
      role: "FARMER",
      preferredLanguage: "hi",
      createdAt: new Date("2024-01-10T09:00:00Z"),
    },
    {
      id: "usr_farmer_ramesh",
      name: "Ramesh Mahto",
      email: "ramesh.m@kisanloop.org",
      role: "FARMER",
      preferredLanguage: "hi",
      createdAt: new Date("2024-01-12T10:00:00Z"),
    },
    {
      id: "usr_farmer_birsa",
      name: "Birsa Munda",
      email: "birsa.munda@kisanloop.org",
      role: "FARMER",
      preferredLanguage: "hi",
      createdAt: new Date("2024-01-15T11:00:00Z"),
    },
    {
      id: "usr_expert_patel",
      name: "Dr. K. Patel (Agronomist)",
      email: "dr.patel@kvk-ranchi.org",
      role: "EXPERT",
      preferredLanguage: "en",
      createdAt: new Date("2024-01-05T08:00:00Z"),
    },
    {
      id: "usr_admin_officer",
      name: "Ramesh Kumar (District Agri Officer)",
      email: "dao.ranchi@jharkhand.gov.in",
      role: "ADMIN",
      preferredLanguage: "en",
      createdAt: new Date("2024-01-01T08:00:00Z"),
    },
  ];

  const farmers = [
    {
      id: "frm_ravi",
      userId: "usr_farmer_ravi",
      name: "Ravi Kumar",
      phone: "+91 98765 43210",
      state: "Jharkhand",
      district: "Ranchi",
      village: "Namkum",
      preferredLanguage: "hi",
      experienceYears: 12,
      createdAt: new Date("2024-01-10T09:00:00Z"),
    },
    {
      id: "frm_ramesh",
      userId: "usr_farmer_ramesh",
      name: "Ramesh Mahto",
      phone: "+91 98765 11223",
      state: "Jharkhand",
      district: "Ranchi",
      village: "Kanke",
      preferredLanguage: "hi",
      experienceYears: 8,
      createdAt: new Date("2024-01-12T10:00:00Z"),
    },
    {
      id: "frm_birsa",
      userId: "usr_farmer_birsa",
      name: "Birsa Munda",
      phone: "+91 98765 33445",
      state: "Jharkhand",
      district: "Khunti",
      village: "Murhu",
      preferredLanguage: "hi",
      experienceYears: 15,
      createdAt: new Date("2024-01-15T11:00:00Z"),
    },
  ];

  const farms = [
    {
      id: "farm_ravi_01",
      farmerId: "frm_ravi",
      name: "Ravi's Main Field (1.2 Acres)",
      totalAreaAcres: 1.2,
      latitude: 23.3441,
      longitude: 85.3096,
      irrigationType: "Rainfed & Pond",
      soilType: "Red Sandy Loam",
      createdAt: new Date("2024-01-10T09:30:00Z"),
    },
    {
      id: "farm_ramesh_01",
      farmerId: "frm_ramesh",
      name: "Kanke North Farm (2.5 Acres)",
      totalAreaAcres: 2.5,
      latitude: 23.4321,
      longitude: 85.3214,
      irrigationType: "Borewell",
      soilType: "Clay Loam",
      createdAt: new Date("2024-01-12T10:30:00Z"),
    },
    {
      id: "farm_birsa_01",
      farmerId: "frm_birsa",
      name: "Murhu Hillside Plot (0.8 Acres)",
      totalAreaAcres: 0.8,
      latitude: 23.1256,
      longitude: 85.2812,
      irrigationType: "Rainfed",
      soilType: "Laterite",
      createdAt: new Date("2024-01-15T11:30:00Z"),
    },
  ];

  const fields = [
    {
      id: "fld_ravi_01",
      farmId: "farm_ravi_01",
      name: "Paddy Parcel A",
      areaAcres: 1.2,
      boundaryGeoJson: {
        type: "Polygon",
        coordinates: [
          [
            [85.3090, 23.3438],
            [85.3102, 23.3438],
            [85.3103, 23.3445],
            [85.3091, 23.3445],
            [85.3090, 23.3438]
          ]
        ]
      },
      soilMoisturePercent: 68.5,
      createdAt: new Date("2024-01-10T09:35:00Z"),
    }
  ];

  const crops = [
    {
      id: "crp_ravi_paddy",
      fieldId: "fld_ravi_01",
      name: "Paddy (धान)",
      variety: "IR-64",
      stage: "Vegetative (वानस्पतिक)",
      sowingDate: new Date("2024-06-25T00:00:00Z"),
      expectedHarvestDate: new Date("2024-11-15T00:00:00Z"),
      status: "ACTIVE",
      createdAt: new Date("2024-06-25T08:00:00Z"),
    }
  ];

  const farmStates = [
    {
      id: "fst_ravi_01",
      farmId: "farm_ravi_01",
      cropId: "crp_ravi_paddy",
      cropName: "Paddy (IR-64)",
      cropStage: "Vegetative",
      soilMoisture: "adequate",
      rainRisk: "high",
      heatRisk: "low",
      pestRisk: "moderate",
      diseaseRisk: "low",
      overallRisk: "medium",
      summary: "Heavy monsoon shower forecast in Ranchi over the next 24-36 hrs. Field already holds 68.5% soil moisture. High risk of waterlogging if irrigated.",
      updatedAt: new Date(),
    }
  ];

  const weatherObservations = [
    {
      id: "wth_ravi_01",
      farmId: "farm_ravi_01",
      temperatureC: 28.5,
      humidityPercent: 88,
      rainfallMm: 42.0,
      rainProbabilityPercent: 85,
      windSpeedKmh: 14.5,
      condition: "Heavy Rain Expected Tomorrow (कल भारी वर्षा)",
      forecastDate: new Date(Date.now() + 86400000),
      recordedAt: new Date(),
    }
  ];

  const soilObservations = [
    {
      id: "soil_ravi_01",
      farmId: "farm_ravi_01",
      nitrogenKgHa: 125,
      phosphorusKgHa: 42,
      potassiumKgHa: 58,
      ph: 6.4,
      organicCarbonPercent: 0.62,
      moisturePercent: 68.5,
      recordedAt: new Date(),
    }
  ];

  const satelliteObservations = [
    {
      id: "sat_ravi_01",
      farmId: "farm_ravi_01",
      ndvi: 0.72,
      ndwi: 0.35,
      evi: 0.68,
      coveragePercent: 100,
      observationDate: new Date(Date.now() - 172800000),
      source: "Sentinel-2 Multi-Spectral / Demo",
    }
  ];

  const pestObservations = [
    {
      id: "pst_ravi_01",
      farmId: "farm_ravi_01",
      cropId: "crp_ravi_paddy",
      pestOrDiseaseName: "Suspected Paddy Blast (झुलसा रोग)",
      confidenceScore: 0.78,
      symptoms: "Spindle-shaped brown lesions observed with grayish centers on upper canopy leaves.",
      imageUrl: "/demo/paddy_leaf_blast.jpg",
      severity: "MODERATE",
      detectedAt: new Date(Date.now() - 43200000),
    }
  ];

  const riskEvents = [
    {
      id: "rsk_ravi_rain",
      farmId: "farm_ravi_01",
      title: "Excess Moisture & Rainfall Event",
      description: "85% chance of 42mm precipitation combined with high baseline moisture (68%). Unnecessary irrigation will cause root rot and nutrient runoff.",
      riskType: "IRRIGATION",
      severity: "HIGH",
      status: "ACTIVE",
      createdAt: new Date(),
    },
    {
      id: "rsk_ravi_blast",
      farmId: "farm_ravi_01",
      title: "Leaf Blast Infection Potential",
      description: "Warm temperature (28°C) and persistent relative humidity (>85%) create ideal microclimate for Pyricularia oryzae fungal proliferation.",
      riskType: "DISEASE",
      severity: "MEDIUM",
      status: "ACTIVE",
      createdAt: new Date(Date.now() - 43200000),
    }
  ];

  const recommendations = [
    {
      id: "rec_ravi_irrigation",
      farmId: "farm_ravi_01",
      cropId: "crp_ravi_paddy",
      riskEventId: "rsk_ravi_rain",
      title: "Hold Irrigation Today (आज सिंचाई न करें)",
      reason: "Rain is expected tomorrow (85% chance). Your field already has sufficient moisture (68.5%). Adding water now risks waterlogging and fertilizer washout.",
      actionSummary: "Skip irrigation today. Inspect drainage channels around Field Parcel A to prevent stagnant ponding.",
      deadline: new Date(Date.now() + 86400000),
      confidenceScore: 0.94,
      riskLevel: "low",
      requiresExpertReview: false,
      isFeasible: true,
      alternativeAction: null,
      status: "ACTIVE",
      createdAt: new Date(),
    },
    {
      id: "rec_ravi_blast_spray",
      farmId: "farm_ravi_01",
      cropId: "crp_ravi_paddy",
      riskEventId: "rsk_ravi_blast",
      title: "Targeted Bio-Fungicide Application (जैविक कवकनाशी का छिड़काव)",
      reason: "Early symptoms of Leaf Blast detected. Prompt prophylactic spray will prevent spores spreading to tillers.",
      actionSummary: "Spray Pseudomonas fluorescens @ 2.5 kg/ha or Tricyclazole 75 WP @ 300-400g/ha in 200L water once rain clears.",
      deadline: new Date(Date.now() + 172800000),
      confidenceScore: 0.88,
      riskLevel: "moderate",
      requiresExpertReview: true,
      isFeasible: true,
      alternativeAction: "If chemical fungicide unavailable, use Neem seed kernel extract (NSKE 5%) as an organic barrier.",
      status: "ACTIVE",
      createdAt: new Date(Date.now() - 36000000),
    }
  ];

  const recommendationEvidence = [
    {
      id: "evd_ravi_01",
      recommendationId: "rec_ravi_irrigation",
      evidenceType: "WEATHER",
      title: "IMD Ranchi Radar Forecast",
      details: "Rainfall probability: 85%, expected accumulation 42mm within 24h.",
      sourceDocumentId: null,
      createdAt: new Date(),
    },
    {
      id: "evd_ravi_02",
      recommendationId: "rec_ravi_irrigation",
      evidenceType: "SOIL",
      title: "Soil Moisture Sensor Telemetry",
      details: "Root-zone volumetric moisture index at 68.5% (Adequate for vegetative paddy).",
      sourceDocumentId: null,
      createdAt: new Date(),
    },
    {
      id: "evd_ravi_03",
      recommendationId: "rec_ravi_irrigation",
      evidenceType: "KNOWLEDGE_DOC",
      title: "ICAR Water Management Guidelines for Kharif Paddy",
      details: "Section 4.2: Avoid irrigation if forecasted precipitation exceeds 25mm and soil water deficit is under 20mm.",
      sourceDocumentId: "kdoc_icar_paddy_2024",
      createdAt: new Date(),
    },
    {
      id: "evd_ravi_04",
      recommendationId: "rec_ravi_blast_spray",
      evidenceType: "VISION",
      title: "Computer Vision Diagnosis",
      details: "Leaf photo analyzed with 78% match for Pyricularia oryzae (Leaf Blast) spindle lesions.",
      sourceDocumentId: null,
      createdAt: new Date(Date.now() - 36000000),
    }
  ];

  const actions = [
    {
      id: "act_ravi_irrigation_hold",
      recommendationId: "rec_ravi_irrigation",
      farmerId: "frm_ravi",
      farmId: "farm_ravi_01",
      title: "Do not irrigate today & clear bund drains",
      description: "Kept irrigation pump switched off. Cleared the excess water spillway.",
      deadline: new Date(Date.now() + 86400000),
      status: "COMPLETED",
      completedAt: new Date(Date.now() - 3600000),
      notes: "Completed by Ravi Kumar. Electric pump remained off.",
      createdAt: new Date(),
    },
    {
      id: "act_ravi_bio_spray",
      recommendationId: "rec_ravi_blast_spray",
      farmerId: "frm_ravi",
      farmId: "farm_ravi_01",
      title: "Apply Bio-Fungicide or Neem Extract",
      description: "Obtain Tricyclazole or Neem Extract from KVK/FPO and spray on infected canopy.",
      deadline: new Date(Date.now() + 172800000),
      status: "NOT_POSSIBLE",
      completedAt: null,
      notes: "Farmer unable to find Tricyclazole in village retail shop.",
      createdAt: new Date(Date.now() - 36000000),
    }
  ];

  const adoptionBarriers = [
    {
      id: "bar_ravi_01",
      actionId: "act_ravi_bio_spray",
      farmerId: "frm_ravi",
      barrierType: "INPUT_UNAVAILABLE",
      notes: "The local Namkum agri-input shop was out of stock of Tricyclazole 75 WP.",
      reportedAt: new Date(Date.now() - 18000000),
    }
  ];

  const outcomes = [
    {
      id: "out_ravi_irrigation",
      actionId: "act_ravi_irrigation_hold",
      farmId: "farm_ravi_01",
      cropId: "crp_ravi_paddy",
      beforeState: "Field moisture at 68.5% with rain imminent.",
      afterState: "Heavy rainfall received as predicted. Farm did not suffer waterlogging or nutrient leach.",
      yieldImpact: "+8% yield preservation",
      costSavingsInr: 1200.0,
      waterSavedLiters: 15000.0,
      expertValidated: true,
      expertValidationNotes: "Valid agronomic intervention verified by KVK agronomist.",
      recordedAt: new Date(Date.now() - 1000000),
    }
  ];

  const expertReviews = [
    {
      id: "exp_rev_ravi_01",
      recommendationId: "rec_ravi_blast_spray",
      expertId: "usr_expert_patel",
      status: "APPROVED",
      expertNotes: "Symptoms are in the early vegetative stage. Recommend immediate organic Neem kernel extract (5%) since chemical stock is unavailable.",
      correctionDetails: "Approved with alternate organic formulation (NSKE 5%) to bypass local input shortage.",
      reviewedAt: new Date(Date.now() - 7200000),
      createdAt: new Date(Date.now() - 36000000),
    }
  ];

  const knowledgeDocuments = [
    {
      id: "kdoc_icar_paddy_2024",
      title: "ICAR Package of Practices for Kharif Rice in Eastern Plateau & Hills",
      filename: "ICAR_Paddy_Guidelines_2024.pdf",
      fileType: "PDF",
      storageKey: "knowledge/icar_paddy_2024.pdf",
      fileSizeBytes: 2457600,
      chunkCount: 42,
      status: "READY",
      errorMessage: null,
      createdAt: new Date("2024-01-05T08:00:00Z"),
    },
    {
      id: "kdoc_pest_mgmt_jh",
      title: "Jharkhand State IPM & Pest Forecasting Manual",
      filename: "Jharkhand_IPM_Manual_v2.docx",
      fileType: "DOCX",
      storageKey: "knowledge/jh_ipm_manual.docx",
      fileSizeBytes: 1245000,
      chunkCount: 28,
      status: "READY",
      errorMessage: null,
      createdAt: new Date("2024-01-15T09:00:00Z"),
    }
  ];

  const datasets = [
    {
      id: "dset_ranchi_survey_2024",
      name: "Ranchi District Kharif Sowing & Soil Dataset 2024",
      filename: "Ranchi_Crop_Survey_2024.csv",
      fileType: "CSV",
      rowCount: 1450,
      columnMapping: {
        farmer_name: "name",
        plot_latitude: "latitude",
        plot_longitude: "longitude",
        cultivated_crop: "crop_name",
        acreage: "area_acres",
        primary_irrigation: "irrigation_type"
      },
      status: "IMPORTED",
      createdAt: new Date("2024-02-01T10:00:00Z"),
    }
  ];

  const auditLogs = [
    {
      id: "aud_01",
      userId: "usr_farmer_ravi",
      action: "ACTION_COMPLETED",
      entityType: "ACTION",
      entityId: "act_ravi_irrigation_hold",
      metadata: { method: "FARMER_ONE_TOUCH_DONE" },
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      id: "aud_02",
      userId: "usr_expert_patel",
      action: "EXPERT_REVIEW_APPROVED",
      entityType: "EXPERT_REVIEW",
      entityId: "exp_rev_ravi_01",
      metadata: { alternatePrescribed: "NSKE 5%" },
      createdAt: new Date(Date.now() - 7200000),
    }
  ];

  return {
    users,
    farmers,
    farms,
    fields,
    crops,
    farmStates,
    weatherObservations,
    soilObservations,
    satelliteObservations,
    pestObservations,
    riskEvents,
    recommendations,
    recommendationEvidence,
    actions,
    adoptionBarriers,
    outcomes,
    expertReviews,
    knowledgeDocuments,
    datasets,
    auditLogs,
  };
}

let globalStore: MockStore = createInitialSeed();

export const mockDb = {
  getStore: () => globalStore,
  reset: () => {
    globalStore = createInitialSeed();
    return globalStore;
  },
  
  users: {
    findMany: () => globalStore.users,
    findById: (id: string) => globalStore.users.find((u) => u.id === id),
  },
  farmers: {
    findMany: () => globalStore.farmers,
    findById: (id: string) => globalStore.farmers.find((f) => f.id === id),
    findByUserId: (userId: string) => globalStore.farmers.find((f) => f.userId === userId),
  },
  farms: {
    findMany: () => globalStore.farms,
    findById: (id: string) => globalStore.farms.find((f) => f.id === id),
    findByFarmerId: (farmerId: string) => globalStore.farms.filter((f) => f.farmerId === farmerId),
  },
  farmStates: {
    findByFarmId: (farmId: string) => globalStore.farmStates.find((fs) => fs.farmId === farmId),
    update: (farmId: string, data: any) => {
      const idx = globalStore.farmStates.findIndex((fs) => fs.farmId === farmId);
      if (idx !== -1) {
        globalStore.farmStates[idx] = { ...globalStore.farmStates[idx], ...data, updatedAt: new Date() };
        return globalStore.farmStates[idx];
      }
      return null;
    }
  },
  pestObservations: {
    findMany: () => globalStore.pestObservations,
    create: (data: any) => {
      const pst = { id: `pst_${Date.now()}`, detectedAt: new Date(), ...data };
      globalStore.pestObservations.unshift(pst);
      return pst;
    },
  },
  recommendations: {
    findMany: () => globalStore.recommendations,
    findByFarmId: (farmId: string) => globalStore.recommendations.filter((r) => r.farmId === farmId),
    findById: (id: string) => globalStore.recommendations.find((r) => r.id === id),
    create: (data: any) => {
      const rec = { id: `rec_${Date.now()}`, createdAt: new Date(), ...data };
      globalStore.recommendations.unshift(rec);
      return rec;
    }
  },
  recommendationEvidence: {
    findByRecommendationId: (recId: string) => globalStore.recommendationEvidence.filter((e) => e.recommendationId === recId),
    create: (data: any) => {
      const evd = { id: `evd_${Date.now()}`, createdAt: new Date(), ...data };
      globalStore.recommendationEvidence.push(evd);
      return evd;
    }
  },
  actions: {
    findMany: () => globalStore.actions,
    findByFarmerId: (farmerId: string) => globalStore.actions.filter((a) => a.farmerId === farmerId),
    findById: (id: string) => globalStore.actions.find((a) => a.id === id),
    update: (id: string, data: any) => {
      const idx = globalStore.actions.findIndex((a) => a.id === id);
      if (idx !== -1) {
        globalStore.actions[idx] = { ...globalStore.actions[idx], ...data };
        return globalStore.actions[idx];
      }
      return null;
    },
    create: (data: any) => {
      const act = { id: `act_${Date.now()}`, createdAt: new Date(), ...data };
      globalStore.actions.unshift(act);
      return act;
    }
  },
  adoptionBarriers: {
    findMany: () => globalStore.adoptionBarriers,
    create: (data: any) => {
      const bar = { id: `bar_${Date.now()}`, reportedAt: new Date(), ...data };
      globalStore.adoptionBarriers.unshift(bar);
      return bar;
    }
  },
  outcomes: {
    findMany: () => globalStore.outcomes,
    findByFarmId: (farmId: string) => globalStore.outcomes.filter((o) => o.farmId === farmId),
    create: (data: any) => {
      const out = { id: `out_${Date.now()}`, recordedAt: new Date(), ...data };
      globalStore.outcomes.unshift(out);
      return out;
    }
  },
  expertReviews: {
    findMany: () => globalStore.expertReviews,
    findById: (id: string) => globalStore.expertReviews.find((er) => er.id === id),
    update: (id: string, data: any) => {
      const idx = globalStore.expertReviews.findIndex((er) => er.id === id);
      if (idx !== -1) {
        globalStore.expertReviews[idx] = { ...globalStore.expertReviews[idx], ...data, reviewedAt: new Date() };
        return globalStore.expertReviews[idx];
      }
      return null;
    },
    create: (data: any) => {
      const er = { id: `exp_rev_${Date.now()}`, createdAt: new Date(), ...data };
      globalStore.expertReviews.unshift(er);
      return er;
    }
  },
  knowledgeDocuments: {
    findMany: () => globalStore.knowledgeDocuments,
    findById: (id: string) => globalStore.knowledgeDocuments.find((kd) => kd.id === id),
    create: (data: any) => {
      const kd = { id: `kdoc_${Date.now()}`, createdAt: new Date(), ...data };
      globalStore.knowledgeDocuments.unshift(kd);
      return kd;
    },
    delete: (id: string) => {
      globalStore.knowledgeDocuments = globalStore.knowledgeDocuments.filter((kd) => kd.id !== id);
    }
  },
  datasets: {
    findMany: () => globalStore.datasets,
    findById: (id: string) => globalStore.datasets.find((d) => d.id === id),
    create: (data: any) => {
      const d = { id: `dset_${Date.now()}`, createdAt: new Date(), ...data };
      globalStore.datasets.unshift(d);
      return d;
    }
  },
  auditLogs: {
    findMany: () => globalStore.auditLogs,
    create: (data: any) => {
      const log = { id: `aud_${Date.now()}`, createdAt: new Date(), ...data };
      globalStore.auditLogs.unshift(log);
      return log;
    }
  }
};
