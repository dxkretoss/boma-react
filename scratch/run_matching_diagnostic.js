import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uasdswkgodhczlbqkira.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhc2Rzd2tnb2RoY3psYnFraXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mjc0MTMsImV4cCI6MjEwMjEwMzQxM30.ejdIeWoWHBg1En2PdGXj00rAm540P1iBpBz9-NykXGI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function calculateMatchScoreDynamic(u1, u2, weights) {
  let score = 0;
  const { lifestyleW, locationW, readinessW, commitmentW } = weights;

  // 1. Location match
  if (u1.location_city && u2.location_city &&
      u1.location_city.toLowerCase().trim() === u2.location_city.toLowerCase().trim()) {
    score += locationW;
  }

  // 2. Setting preference
  if (u1.setting_preference && u2.setting_preference &&
      u1.setting_preference.toLowerCase().trim() === u2.setting_preference.toLowerCase().trim()) {
    score += lifestyleW;
  }

  // 3. Commitment timeline
  if (u1.commitment_timeline && u2.commitment_timeline &&
      u1.commitment_timeline === u2.commitment_timeline) {
    score += commitmentW;
  }

  // 4. Housing intent
  if (u1.housing_intent && u2.housing_intent &&
      u1.housing_intent === u2.housing_intent) {
    score += readinessW;
  } else {
    score += (readinessW / 2);
  }

  return Math.round(score);
}

async function run() {
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .neq('role', 'admin');

  if (error) {
    console.error(error);
    return;
  }

  console.log('Users found:', users.map(u => ({
    name: u.name,
    email: u.email,
    city: u.location_city,
    setting: u.setting_preference,
    timeline: u.commitment_timeline,
    intent: u.housing_intent,
    status: u.matching_status
  })));

  const weights = { lifestyleW: 30, locationW: 30, readinessW: 20, commitmentW: 20 };

  console.log('\nCompatibility Scores:');
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const u1 = users[i];
      const u2 = users[j];
      const score = calculateMatchScoreDynamic(u1, u2, weights);
      console.log(`${u1.name} <-> ${u2.name}: ${score}%`);
    }
  }
}

run();
