/**
 * Creates/updates all 25 seed accounts in Supabase Auth (Admin API),
 * then ensures their profiles are onboarding-complete so they land on /feed.
 *
 * Run once from the repo root:
 *   node scripts/set-seed-passwords.mjs
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://yjvjhqwuufecykvolmnq.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqdmpocXd1dWZlY3lrdm9sbW5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIzNzMxMSwiZXhwIjoyMDk1ODEzMzExfQ.PPxqrbo2Pdu6FHLc7QwPXrTBojnv6jyPU_LgyO6bI8U";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = "Test@1234";

const SEED_USERS = [
  { id: "11111111-0001-0001-0001-000000000001", email: "amara.okafor@seed.roomie.ng",     name: "Amara Okafor",    avatar: "https://i.pravatar.cc/150?img=1",  age: 19, gender: "female", city: "Lagos",        uni: "UNILAG",   course: "Business Administration", year: 2, min: 70000,  max: 120000, tags: ["studious","homebody","religious"],      sleep: "early_bird", clean: "very_tidy", noise: "quiet",    verified: true },
  { id: "11111111-0002-0002-0002-000000000002", email: "emeka.nwosu@seed.roomie.ng",      name: "Emeka Nwosu",     avatar: "https://i.pravatar.cc/150?img=3",  age: 21, gender: "male",   city: "Abuja",        uni: "UNIABUJA", course: "Computer Science",       year: 3, min: 50000,  max: 80000,  tags: ["gamer","studious","homebody"],          sleep: "night_owl",  clean: "relaxed",  noise: "moderate", verified: false },
  { id: "11111111-0003-0003-0003-000000000003", email: "fatimah.bello@seed.roomie.ng",    name: "Fatimah Bello",   avatar: "https://i.pravatar.cc/150?img=5",  age: 20, gender: "female", city: "Lagos",        uni: "UNILAG",   course: "Pharmacy",               year: 2, min: 60000,  max: 100000, tags: ["religious","studious","homebody"],      sleep: "early_bird", clean: "tidy",     noise: "very_quiet", verified: true },
  { id: "11111111-0004-0004-0004-000000000004", email: "chidi.eze@seed.roomie.ng",        name: "Chidi Eze",       avatar: "https://i.pravatar.cc/150?img=7",  age: 22, gender: "male",   city: "Enugu",        uni: "UNN",      course: "Mechanical Engineering", year: 4, min: 40000,  max: 70000,  tags: ["foodie","social","athletic"],           sleep: "flexible",   clean: "tidy",     noise: "moderate", verified: false },
  { id: "11111111-0005-0005-0005-000000000005", email: "ngozi.adeyemi@seed.roomie.ng",    name: "Ngozi Adeyemi",   avatar: "https://i.pravatar.cc/150?img=9",  age: 23, gender: "female", city: "Ibadan",       uni: "UI",       course: "Law",                    year: 5, min: 55000,  max: 90000,  tags: ["studious","homebody","traveler"],       sleep: "night_owl",  clean: "very_tidy", noise: "very_quiet", verified: true },
  { id: "11111111-0006-0006-0006-000000000006", email: "tunde.afolabi@seed.roomie.ng",    name: "Tunde Afolabi",   avatar: "https://i.pravatar.cc/150?img=11", age: 21, gender: "male",   city: "Lagos",        uni: "LASU",     course: "Mass Communication",     year: 3, min: 45000,  max: 75000,  tags: ["social","traveler","foodie"],           sleep: "flexible",   clean: "relaxed",  noise: "lively",   verified: false },
  { id: "11111111-0007-0007-0007-000000000007", email: "adaeze.okoro@seed.roomie.ng",     name: "Adaeze Okoro",    avatar: "https://i.pravatar.cc/150?img=13", age: 22, gender: "female", city: "Port Harcourt",uni: "UNIPORT",  course: "Medicine and Surgery",   year: 3, min: 80000,  max: 150000, tags: ["studious","religious","homebody"],      sleep: "early_bird", clean: "very_tidy", noise: "quiet",   verified: true },
  { id: "11111111-0008-0008-0008-000000000008", email: "ibrahim.musa@seed.roomie.ng",     name: "Ibrahim Musa",    avatar: "https://i.pravatar.cc/150?img=15", age: 20, gender: "male",   city: "Kano",         uni: "BUK",      course: "Accounting",             year: 2, min: 30000,  max: 55000,  tags: ["religious","studious","homebody"],      sleep: "early_bird", clean: "tidy",     noise: "quiet",    verified: false },
  { id: "11111111-0009-0009-0009-000000000009", email: "chioma.nwachukwu@seed.roomie.ng", name: "Chioma Nwachukwu",avatar: "https://i.pravatar.cc/150?img=17", age: 21, gender: "female", city: "Abuja",        uni: "BAZE",     course: "Finance",                year: 3, min: 65000,  max: 110000, tags: ["social","foodie","traveler"],           sleep: "night_owl",  clean: "tidy",     noise: "moderate", verified: false },
  { id: "11111111-0010-0010-0010-000000000010", email: "segun.olawale@seed.roomie.ng",    name: "Segun Olawale",   avatar: "https://i.pravatar.cc/150?img=19", age: 20, gender: "male",   city: "Lagos",        uni: "UNILAG",   course: "Economics",              year: 2, min: 45000,  max: 80000,  tags: ["athletic","social","gamer"],            sleep: "flexible",   clean: "relaxed",  noise: "moderate", verified: false },
  { id: "11111111-0011-0011-0011-000000000011", email: "kemi.adebayo@seed.roomie.ng",     name: "Kemi Adebayo",    avatar: "https://i.pravatar.cc/150?img=21", age: 22, gender: "female", city: "Lagos",        uni: "UNILAG",   course: "Biochemistry",           year: 4, min: 60000,  max: 100000, tags: ["studious","religious","homebody"],      sleep: "early_bird", clean: "very_tidy", noise: "quiet",   verified: true },
  { id: "11111111-0012-0012-0012-000000000012", email: "uche.obiechina@seed.roomie.ng",   name: "Uche Obiechina",  avatar: "https://i.pravatar.cc/150?img=23", age: 23, gender: "male",   city: "Enugu",        uni: "UNN",      course: "Architecture",           year: 5, min: 50000,  max: 85000,  tags: ["studious","gamer","homebody"],          sleep: "night_owl",  clean: "tidy",     noise: "moderate", verified: false },
  { id: "11111111-0013-0013-0013-000000000013", email: "halima.abdullahi@seed.roomie.ng", name: "Halima Abdullahi",avatar: "https://i.pravatar.cc/150?img=25", age: 20, gender: "female", city: "Kano",         uni: "BUK",      course: "Nursing",                year: 2, min: 35000,  max: 60000,  tags: ["religious","studious","homebody"],      sleep: "early_bird", clean: "tidy",     noise: "quiet",    verified: false },
  { id: "11111111-0014-0014-0014-000000000014", email: "david.akintola@seed.roomie.ng",   name: "David Akintola",  avatar: "https://i.pravatar.cc/150?img=27", age: 21, gender: "male",   city: "Ibadan",       uni: "UI",       course: "Physics",                year: 3, min: 45000,  max: 75000,  tags: ["studious","athletic","gamer"],          sleep: "flexible",   clean: "tidy",     noise: "moderate", verified: false },
  { id: "11111111-0015-0015-0015-000000000015", email: "blessing.onyeka@seed.roomie.ng",  name: "Blessing Onyeka", avatar: "https://i.pravatar.cc/150?img=29", age: 22, gender: "female", city: "Port Harcourt",uni: "UNIPORT",  course: "Chemical Engineering",   year: 3, min: 55000,  max: 90000,  tags: ["studious","social","homebody"],         sleep: "flexible",   clean: "tidy",     noise: "moderate", verified: true },
  { id: "11111111-0016-0016-0016-000000000016", email: "michael.obi@seed.roomie.ng",      name: "Michael Obi",     avatar: "https://i.pravatar.cc/150?img=31", age: 24, gender: "male",   city: "Abuja",        uni: "UNIABUJA", course: "Political Science",      year: 4, min: 55000,  max: 90000,  tags: ["social","traveler","foodie"],           sleep: "flexible",   clean: "relaxed",  noise: "lively",   verified: false },
  { id: "11111111-0017-0017-0017-000000000017", email: "sade.fashola@seed.roomie.ng",     name: "Sade Fashola",    avatar: "https://i.pravatar.cc/150?img=33", age: 20, gender: "female", city: "Lagos",        uni: "LASU",     course: "Sociology",              year: 2, min: 40000,  max: 70000,  tags: ["social","foodie","traveler"],           sleep: "flexible",   clean: "tidy",     noise: "moderate", verified: false },
  { id: "11111111-0018-0018-0018-000000000018", email: "kenny.okonkwo@seed.roomie.ng",    name: "Kenny Okonkwo",   avatar: "https://i.pravatar.cc/150?img=35", age: 21, gender: "male",   city: "Enugu",        uni: "UNN",      course: "Computer Engineering",   year: 3, min: 45000,  max: 75000,  tags: ["gamer","studious","homebody"],          sleep: "night_owl",  clean: "relaxed",  noise: "moderate", verified: false },
  { id: "11111111-0019-0019-0019-000000000019", email: "nkechi.okafor@seed.roomie.ng",    name: "Nkechi Okafor",   avatar: "https://i.pravatar.cc/150?img=37", age: 22, gender: "female", city: "Lagos",        uni: "UNILAG",   course: "Mass Communication",     year: 3, min: 55000,  max: 85000,  tags: ["social","traveler","foodie"],           sleep: "flexible",   clean: "tidy",     noise: "lively",   verified: false },
  { id: "11111111-0020-0020-0020-000000000020", email: "frank.egwuatu@seed.roomie.ng",    name: "Frank Egwuatu",   avatar: "https://i.pravatar.cc/150?img=39", age: 23, gender: "male",   city: "Abuja",        uni: "UNIABUJA", course: "Business Administration",year: 4, min: 60000,  max: 100000, tags: ["studious","athletic","homebody"],       sleep: "early_bird", clean: "tidy",     noise: "moderate", verified: false },
  { id: "11111111-0021-0021-0021-000000000021", email: "yetunde.balogun@seed.roomie.ng",  name: "Yetunde Balogun", avatar: "https://i.pravatar.cc/150?img=41", age: 21, gender: "female", city: "Lagos",        uni: "UNILAG",   course: "Economics",              year: 3, min: 50000,  max: 85000,  tags: ["studious","social","religious"],        sleep: "early_bird", clean: "tidy",     noise: "quiet",    verified: true },
  { id: "11111111-0022-0022-0022-000000000022", email: "chuka.anyanwu@seed.roomie.ng",    name: "Chuka Anyanwu",   avatar: "https://i.pravatar.cc/150?img=43", age: 22, gender: "male",   city: "Nsukka",       uni: "UNN",      course: "History",                year: 4, min: 35000,  max: 60000,  tags: ["studious","homebody","gamer"],          sleep: "night_owl",  clean: "relaxed",  noise: "moderate", verified: false },
  { id: "11111111-0023-0023-0023-000000000023", email: "aisha.garba@seed.roomie.ng",      name: "Aisha Garba",     avatar: "https://i.pravatar.cc/150?img=45", age: 19, gender: "female", city: "Kano",         uni: "BUK",      course: "Public Health",          year: 1, min: 30000,  max: 55000,  tags: ["religious","studious","homebody"],      sleep: "early_bird", clean: "very_tidy", noise: "quiet",   verified: false },
  { id: "11111111-0024-0024-0024-000000000024", email: "rotimi.adeleke@seed.roomie.ng",   name: "Rotimi Adeleke",  avatar: "https://i.pravatar.cc/150?img=47", age: 22, gender: "male",   city: "Ibadan",       uni: "UI",       course: "Agricultural Science",   year: 3, min: 40000,  max: 65000,  tags: ["foodie","athletic","social"],           sleep: "flexible",   clean: "tidy",     noise: "moderate", verified: false },
  { id: "11111111-0025-0025-0025-000000000025", email: "obiageli.nwobi@seed.roomie.ng",   name: "Obiageli Nwobi",  avatar: "https://i.pravatar.cc/150?img=49", age: 20, gender: "female", city: "Port Harcourt",uni: "UNIPORT",  course: "Nursing Science",        year: 2, min: 45000,  max: 75000,  tags: ["religious","studious","social"],        sleep: "early_bird", clean: "tidy",     noise: "quiet",    verified: false },
];

let authOk = 0, authFail = 0, profileOk = 0, profileFail = 0;

for (const u of SEED_USERS) {
  // ── 1. Auth user: update if exists, create if missing ──────────────────
  const { error: updateErr } = await supabase.auth.admin.updateUserById(u.id, {
    password: PASSWORD,
    email_confirm: true,
  });

  if (updateErr?.message === "User not found") {
    // Create the user with the fixed UUID
    const { error: createErr } = await supabase.auth.admin.createUser({
      email: u.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: u.name, avatar_url: u.avatar },
      // Supabase doesn't support custom IDs via admin.createUser on the hosted platform.
      // We create and then update the ID via service-role DB call.
    });

    if (createErr) {
      console.error(`  AUTH FAIL  ${u.email}: ${createErr.message}`);
      authFail++;
      continue;
    }

    // Fetch the newly created user by email to get its generated UUID
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const created = users.find((usr) => usr.email === u.email);

    if (!created) {
      console.error(`  AUTH FAIL  ${u.email}: created but not found`);
      authFail++;
      continue;
    }

    // Upsert profile using the GENERATED id (not the seed UUID)
    await upsertProfile(created.id, u);
    console.log(`  AUTH CREATE  ${u.email} → ${created.id}`);
    authOk++;
    continue;
  }

  if (updateErr) {
    console.error(`  AUTH FAIL  ${u.email}: ${updateErr.message}`);
    authFail++;
    continue;
  }

  console.log(`  AUTH UPDATE  ${u.email}`);
  authOk++;

  // Also ensure profile exists with the seed UUID
  await upsertProfile(u.id, u);
}

async function upsertProfile(userId, u) {
  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        display_name: u.name,
        avatar_url: u.avatar,
        age: u.age,
        gender: u.gender,
        city: u.city,
        university: u.uni,
        course: u.course,
        year_of_study: u.year,
        min_budget: u.min,
        max_budget: u.max,
        lifestyle_tags: u.tags,
        sleep_schedule: u.sleep,
        cleanliness: u.clean,
        noise_pref: u.noise,
        allows_smoking: false,
        allows_pets: false,
        allows_guests: true,
        student_verified: u.verified,
        verification_status: u.verified ? "VERIFIED" : "UNVERIFIED",
        onboarding_step: 6,
        onboarding_complete: true,
        is_active: true,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

  if (error) {
    console.error(`    PROFILE FAIL ${u.email}: ${error.message}`);
    profileFail++;
  } else {
    profileOk++;
  }
}

console.log(`\nAuth: ${authOk} ok, ${authFail} fail`);
console.log(`Profile: ${profileOk} ok, ${profileFail} fail`);
