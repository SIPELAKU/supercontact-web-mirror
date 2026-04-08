#!/usr/bin/env node

/**
 * 🚀 Supercontact Web — Deploy Manager
 *
 * Script all-in-one untuk deployment:
 *
 *   npm run deploy              → Menu interaktif
 *   npm run deploy:status       → Cek status semua branch & tag
 *   npm run deploy:staging      → Deploy dev → staging (auto RC)
 *   npm run deploy:prod         → Deploy staging → prod
 *   npm run deploy:staging-tags → Lihat tag RC staging
 *   npm run deploy:prod-tags    → Lihat tag production
 *   npm run deploy:hotfix-staging → Hotfix langsung ke staging
 *   npm run deploy:hotfix-prod    → Hotfix langsung ke production
 */

const { execSync } = require('child_process');
const readline = require('readline');

// ── Helpers ──────────────────────────────────────────────────

function run(cmd, show = false) {
  try {
    const result = execSync(cmd, { encoding: 'utf-8', stdio: show ? 'inherit' : ['pipe', 'pipe', 'pipe'] });
    return typeof result === 'string' ? result.trim() : '';
  } catch (e) {
    if (show) return '';
    return e.stdout ? e.stdout.toString().trim() : '';
  }
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()); }));
}

function sep() { console.log('─'.repeat(60)); }

function getCurrentBranch() { return run('git rev-parse --abbrev-ref HEAD'); }

function getPackageVersion() {
  try { return require('../package.json').version; } catch { return 'unknown'; }
}

function getTagsMatching(pattern) {
  const result = run(`git tag -l "${pattern}" --sort=-v:refname`);
  return result ? result.split('\n').filter(Boolean) : [];
}

function getTagMessage(tag) {
  return run(`git tag -l -n1 "${tag}"`).replace(tag, '').trim();
}

function getTagDate(tag) {
  const d = run(`git log -1 --format=%ci "${tag}" 2>nul`);
  return d ? d.substring(0, 16) : '-';
}

function getLatestTagOnBranch(branch) {
  return run(`git describe --tags --abbrev=0 ${branch} 2>nul`) ||
         run(`git describe --tags --abbrev=0 origin/${branch} 2>nul`) || '-';
}

// ── Status ───────────────────────────────────────────────────

function getLatestCommitOnBranch(branch) {
  const sha = run(`git log -1 --format=%h ${branch} 2>nul`) ||
              run(`git log -1 --format=%h origin/${branch} 2>nul`) || '-';
  const msg = run(`git log -1 --format=%s ${branch} 2>nul`) ||
              run(`git log -1 --format=%s origin/${branch} 2>nul`) || '-';
  const date = run(`git log -1 --format=%ci ${branch} 2>nul`) ||
               run(`git log -1 --format=%ci origin/${branch} 2>nul`) || '-';
  return { sha, msg: msg.substring(0, 50), date: date.substring(0, 16) };
}

function showStatus() {
  console.log('\n🚀  SUPERCONTACT WEB — Deployment Status');
  sep();
  console.log(`📁  Branch saat ini  : ${getCurrentBranch()}`);
  console.log(`📦  package.json     : v${getPackageVersion()}`);
  sep();

  console.log('\n📊  Status Per Branch');
  sep();
  for (const [icon, branch] of [['🔧', 'dev'], ['🧪', 'staging'], ['🟢', 'main']]) {
    const tag = getLatestTagOnBranch(branch);
    const commit = getLatestCommitOnBranch(branch);
    console.log(`${icon}  ${branch.padEnd(10)} → Tag: ${tag.padEnd(18)} Commit: ${commit.sha} (${commit.date})`);
    console.log(`              → ${commit.msg}`);
  }
  sep();
}

function showTags(type) {
  if (type === 'staging' || type === 'all') {
    console.log('\n🧪  Tag Staging (RC)');
    sep();
    const tags = getTagsMatching('v*-rc.*');
    if (!tags.length) { console.log('   Belum ada tag RC.'); }
    else {
      console.log(`   Total: ${tags.length} tag\n`);
      for (const t of tags.slice(0, 15)) {
        console.log(`   ${t.padEnd(22)} ${getTagDate(t)}  ${getTagMessage(t)}`);
      }
    }
    sep();
  }

  if (type === 'prod' || type === 'all') {
    console.log('\n🟢  Tag Production (Rilis)');
    sep();
    const tags = getTagsMatching('v*').filter(t => !t.includes('-'));
    if (!tags.length) { console.log('   Belum ada tag rilis.'); }
    else {
      console.log(`   Total: ${tags.length} tag\n`);
      for (const t of tags.slice(0, 15)) {
        console.log(`   ${t.padEnd(22)} ${getTagDate(t)}  ${getTagMessage(t)}`);
      }
    }
    sep();
  }
}

// ── Deploy to Staging ────────────────────────────────────────

function getNextRCTag() {
  const version = getPackageVersion();
  const rcTags = getTagsMatching(`v${version}-rc.*`);

  if (rcTags.length === 0) {
    return { tag: `v${version}-rc.1`, rcNum: 1, existing: [] };
  }

  // Cari nomor RC tertinggi
  let maxRC = 0;
  for (const t of rcTags) {
    const match = t.match(/-rc\.(\d+)$/);
    if (match) maxRC = Math.max(maxRC, parseInt(match[1]));
  }

  return { tag: `v${version}-rc.${maxRC + 1}`, rcNum: maxRC + 1, existing: rcTags };
}

async function deployStaging() {
  console.log('\n🧪  DEPLOY KE STAGING');
  sep();

  // Fetch dulu
  console.log('⏳ Fetching dari remote...');
  run('git fetch --all --tags --force');

  // Cek branch saat ini
  const current = getCurrentBranch();
  if (current !== 'dev') {
    console.log(`\n⚠️  Kamu sekarang di branch "${current}", pindah ke dev dulu...`);
    run('git checkout dev', true);
    run('git pull origin dev', true);
  } else {
    console.log('📥 Pulling dev terbaru...');
    run('git pull origin dev', true);
  }

  // Hitung tag RC berikutnya
  const { tag, rcNum, existing } = getNextRCTag();

  console.log('');
  sep();
  console.log(`📦  Versi          : v${getPackageVersion()}`);
  if (existing.length > 0) {
    console.log(`🧪  RC sebelumnya  : ${existing[0]} (RC ke-${rcNum - 1})`);
  }
  console.log(`🆕  Tag berikutnya : ${tag} (RC ke-${rcNum})`);
  sep();

  // Minta deskripsi
  const desc = await ask(`\n📝 Deskripsi deployment (atau kosong untuk skip): `);
  const message = desc || `RC ${rcNum}`;
  const fullMessage = `RC ${rcNum} - ${message}`;

  console.log('');
  console.log('📋 Langkah yang akan dijalankan:');
  console.log(`   1. git checkout staging && git pull`);
  console.log(`   2. git merge --no-ff dev`);
  console.log(`   3. git push origin staging`);
  console.log(`   4. git tag -a ${tag} -m "${fullMessage}"`);
  console.log(`   5. git push origin ${tag}`);
  console.log('');

  const confirm = await ask('🚀 Lanjut deploy? (y/n): ');
  if (confirm.toLowerCase() !== 'y') {
    console.log('❌ Dibatalkan.');
    return;
  }

  console.log('\n⏳ Menjalankan deployment...\n');

  // Step 1: checkout staging
  console.log('1️⃣  Checkout staging...');
  run('git checkout staging', true);
  run('git pull origin staging', true);

  // Step 2: merge dev
  console.log('\n2️⃣  Merge dev ke staging (--no-ff)...');
  const mergeResult = run('git merge --no-ff dev 2>&1');
  if (mergeResult.includes('CONFLICT')) {
    console.log('\n❌ MERGE CONFLICT! Selesaikan conflict dulu, lalu jalankan ulang.');
    console.log('   Untuk membatalkan: git merge --abort');
    run('git checkout dev');
    return;
  }
  console.log(`   ${mergeResult || 'Already up to date.'}`);

  // Step 3: push staging
  console.log('\n3️⃣  Push staging...');
  run('git push origin staging', true);

  // Step 4: buat tag
  console.log(`\n4️⃣  Membuat tag ${tag}...`);
  run(`git tag -a ${tag} -m "${fullMessage}"`);

  // Step 5: push tag
  console.log(`\n5️⃣  Push tag ${tag}...`);
  run(`git push origin ${tag}`, true);

  // Kembali ke dev
  console.log('\n6️⃣  Kembali ke branch dev...');
  run('git checkout dev');

  console.log('');
  sep();
  console.log(`✅  Staging deployment selesai!`);
  console.log(`    Tag    : ${tag}`);
  console.log(`    Pesan  : ${fullMessage}`);
  console.log(`    URL    : https://solvera-supercontact-staging.vercel.app`);
  console.log(`    CI/CD  : Cek GitLab → CI/CD → Pipelines`);
  sep();
  console.log('');
}

// ── Deploy to Production ─────────────────────────────────────

async function deployProd() {
  console.log('\n🟢  DEPLOY KE PRODUCTION');
  sep();

  // Fetch dulu
  console.log('⏳ Fetching dari remote...');
  run('git fetch --all --tags --force');

  const version = getPackageVersion();
  const releaseTag = `v${version}`;

  // Cek apakah tag rilis sudah ada
  const existing = getTagsMatching(releaseTag);
  if (existing.length > 0) {
    console.log(`\n❌ Tag ${releaseTag} sudah ada! Bump versi di package.json dulu.`);
    console.log(`   Gunakan: npm run release:patch / release:minor / release:major`);
    return;
  }

  // Cek RC tags untuk versi ini
  const rcTags = getTagsMatching(`v${version}-rc.*`);
  if (rcTags.length === 0) {
    console.log(`\n⚠️  Tidak ada tag RC untuk v${version}.`);
    console.log(`   Deploy ke staging dulu sebelum ke production.`);
    const force = await ask('   Tetap lanjut? (y/n): ');
    if (force.toLowerCase() !== 'y') return;
  } else {
    console.log(`\n✅ Ditemukan ${rcTags.length} RC tag untuk v${version}:`);
    for (const t of rcTags.slice(0, 5)) {
      console.log(`   ${t} — ${getTagMessage(t)}`);
    }
  }

  console.log('');
  sep();
  console.log(`📦  Versi           : v${version}`);
  console.log(`🏷️   Tag rilis       : ${releaseTag}`);
  console.log(`🌐  URL Production  : https://solvera-supercontact.vercel.app`);
  sep();

  const desc = await ask(`\n📝 Deskripsi rilis (atau kosong): `);
  const message = desc ? `Release v${version} - ${desc}` : `Release v${version}`;

  console.log('');
  console.log('📋 Langkah yang akan dijalankan:');
  console.log(`   1. git checkout main && git pull`);
  console.log(`   2. git merge --no-ff staging`);
  console.log(`   3. git push origin main`);
  console.log(`   4. git tag -a ${releaseTag} -m "${message}"`);
  console.log(`   5. git push origin ${releaseTag}`);
  console.log('');

  const confirm = await ask('🚀 Deploy ke PRODUCTION? Ini serius! (yes/no): ');
  if (confirm.toLowerCase() !== 'yes') {
    console.log('❌ Dibatalkan.');
    return;
  }

  console.log('\n⏳ Menjalankan deployment...\n');

  console.log('1️⃣  Checkout main...');
  run('git checkout main', true);
  run('git pull origin main', true);

  console.log('\n2️⃣  Merge staging ke main (--no-ff)...');
  const mergeResult = run('git merge --no-ff staging 2>&1');
  if (mergeResult.includes('CONFLICT')) {
    console.log('\n❌ MERGE CONFLICT! Selesaikan conflict dulu.');
    console.log('   Untuk membatalkan: git merge --abort');
    return;
  }
  console.log(`   ${mergeResult || 'Already up to date.'}`);

  console.log('\n3️⃣  Push main...');
  run('git push origin main', true);

  console.log(`\n4️⃣  Membuat tag ${releaseTag}...`);
  run(`git tag -a ${releaseTag} -m "${message}"`);

  console.log(`\n5️⃣  Push tag ${releaseTag}...`);
  run(`git push origin ${releaseTag}`, true);

  // Backmerge to dev
  console.log('\n6️⃣  Backmerge ke dev...');
  run('git checkout dev', true);
  run('git pull origin dev', true);
  run('git merge main', true);
  run('git push origin dev', true);

  console.log('');
  sep();
  console.log(`✅  Production deployment selesai!`);
  console.log(`    Tag    : ${releaseTag}`);
  console.log(`    Pesan  : ${message}`);
  console.log(`    URL    : https://solvera-supercontact.vercel.app`);
  console.log(`    CI/CD  : Cek GitLab → CI/CD → Pipelines`);
  console.log(`    Dev    : Sudah di-backmerge ✅`);
  sep();
  console.log('');
}

// ── Hotfix Deployment ────────────────────────────────────────
//
// Hotfix = push langsung ke staging/main TANPA buat tag.
// GitLab CI akan otomatis deploy karena rules sudah match
// push ke branch staging/main.
//
// Alur:
//   1. Cherry-pick atau commit fix di branch saat ini
//   2. Push langsung ke staging/main
//   3. GitLab CI otomatis deploy
// ──────────────────────────────────────────────────────────────

async function deployHotfix(target) {
  const isStaging = target === 'staging';
  const icon = isStaging ? '🧪' : '🟢';
  const envName = isStaging ? 'STAGING' : 'PRODUCTION';
  const targetBranch = isStaging ? 'staging' : 'main';
  const url = isStaging
    ? 'https://solvera-supercontact-staging.vercel.app'
    : 'https://solvera-supercontact.vercel.app';

  console.log(`\n🔥  HOTFIX DEPLOY KE ${envName}`);
  sep();

  // Fetch dulu
  console.log('⏳ Fetching dari remote...');
  run('git fetch --all --tags --force');

  const current = getCurrentBranch();
  const version = getPackageVersion();
  const currentSha = run('git rev-parse --short HEAD');

  console.log(`\n📁  Branch saat ini : ${current}`);
  console.log(`📦  Versi           : v${version}`);
  console.log(`🔗  Commit          : ${currentSha}`);
  console.log(`🎯  Target          : ${targetBranch} (${envName})`);
  sep();

  // Tampilkan commit yang belum ada di target
  const pendingCommits = run(`git log origin/${targetBranch}..HEAD --oneline 2>nul`);
  if (pendingCommits) {
    console.log(`\n📋 Commit yang akan di-deploy ke ${envName}:`);
    const commits = pendingCommits.split('\n').filter(Boolean);
    for (const c of commits.slice(0, 10)) {
      console.log(`   • ${c}`);
    }
    if (commits.length > 10) {
      console.log(`   ... dan ${commits.length - 10} commit lainnya`);
    }
  } else if (current === targetBranch) {
    console.log(`\n📋 Kamu sudah di branch ${targetBranch}.`);
    console.log(`   Push akan memicu deployment otomatis via GitLab CI.`);
  } else {
    console.log(`\n⚠️  Tidak ada commit baru dibanding origin/${targetBranch}.`);
  }

  // Pilih metode
  console.log('');
  sep();
  console.log('📍 Metode hotfix:');
  console.log(`   1. Cherry-pick commit tertentu ke ${targetBranch}`);
  console.log(`   2. Merge branch saat ini (${current}) ke ${targetBranch}`);
  console.log(`   3. Push langsung (jika sudah di branch ${targetBranch})`);
  sep();

  const method = await ask('\nPilih metode (1/2/3): ');

  if (method === '1') {
    // Cherry-pick
    const commitHash = await ask('🔗 Masukkan commit hash yang ingin di-cherry-pick: ');
    if (!commitHash) {
      console.log('❌ Commit hash diperlukan.');
      return;
    }

    // Verify commit exists
    const commitInfo = run(`git log -1 --oneline ${commitHash} 2>nul`);
    if (!commitInfo) {
      console.log(`❌ Commit ${commitHash} tidak ditemukan.`);
      return;
    }

    console.log(`\n📋 Langkah yang akan dijalankan:`);
    console.log(`   1. git checkout ${targetBranch} && git pull`);
    console.log(`   2. git cherry-pick ${commitHash}`);
    console.log(`   3. git push origin ${targetBranch}`);
    console.log(`   4. GitLab CI otomatis deploy ke ${envName}`);
    console.log('');

    const confirm = await ask(`🔥 Lanjut hotfix ke ${envName}? (y/n): `);
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Dibatalkan.');
      return;
    }

    console.log('\n⏳ Menjalankan hotfix...\n');

    console.log(`1️⃣  Checkout ${targetBranch}...`);
    run(`git checkout ${targetBranch}`, true);
    run(`git pull origin ${targetBranch}`, true);

    console.log(`\n2️⃣  Cherry-pick ${commitHash}...`);
    const cherryResult = run(`git cherry-pick ${commitHash} 2>&1`);
    if (cherryResult.includes('CONFLICT')) {
      console.log('\n❌ CONFLICT saat cherry-pick! Selesaikan dulu.');
      console.log('   Untuk membatalkan: git cherry-pick --abort');
      return;
    }
    console.log(`   ${cherryResult || 'Success'}`);

    console.log(`\n3️⃣  Push ${targetBranch}...`);
    run(`git push origin ${targetBranch}`, true);

    // Kembali ke branch asal
    console.log(`\n4️⃣  Kembali ke branch ${current}...`);
    run(`git checkout ${current}`);

  } else if (method === '2') {
    // Merge
    console.log(`\n📋 Langkah yang akan dijalankan:`);
    console.log(`   1. git checkout ${targetBranch} && git pull`);
    console.log(`   2. git merge --no-ff ${current}`);
    console.log(`   3. git push origin ${targetBranch}`);
    console.log(`   4. GitLab CI otomatis deploy ke ${envName}`);
    console.log('');

    const confirm = await ask(`🔥 Lanjut hotfix ke ${envName}? (y/n): `);
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Dibatalkan.');
      return;
    }

    console.log('\n⏳ Menjalankan hotfix...\n');

    console.log(`1️⃣  Checkout ${targetBranch}...`);
    run(`git checkout ${targetBranch}`, true);
    run(`git pull origin ${targetBranch}`, true);

    console.log(`\n2️⃣  Merge ${current} ke ${targetBranch}...`);
    const mergeResult = run(`git merge --no-ff ${current} 2>&1`);
    if (mergeResult.includes('CONFLICT')) {
      console.log('\n❌ MERGE CONFLICT! Selesaikan conflict dulu.');
      console.log('   Untuk membatalkan: git merge --abort');
      return;
    }
    console.log(`   ${mergeResult || 'Already up to date.'}`);

    console.log(`\n3️⃣  Push ${targetBranch}...`);
    run(`git push origin ${targetBranch}`, true);

    // Kembali ke branch asal
    console.log(`\n4️⃣  Kembali ke branch ${current}...`);
    run(`git checkout ${current}`);

  } else if (method === '3') {
    // Push langsung
    if (current !== targetBranch) {
      console.log(`\n⚠️  Kamu di branch ${current}, bukan ${targetBranch}.`);
      const switchBranch = await ask(`   Pindah ke ${targetBranch}? (y/n): `);
      if (switchBranch.toLowerCase() === 'y') {
        run(`git checkout ${targetBranch}`, true);
        run(`git pull origin ${targetBranch}`, true);
      } else {
        console.log('❌ Dibatalkan.');
        return;
      }
    }

    const confirm = await ask(`\n🔥 Push ke ${targetBranch} dan deploy ke ${envName}? (y/n): `);
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Dibatalkan.');
      return;
    }

    console.log(`\n⏳ Pushing ${targetBranch}...`);
    run(`git push origin ${targetBranch}`, true);

  } else {
    console.log('❌ Pilihan tidak valid.');
    return;
  }

  console.log('');
  sep();
  console.log(`${icon}  Hotfix deployment ke ${envName} selesai!`);
  console.log(`    Commit : ${run('git rev-parse --short HEAD')}`);
  console.log(`    URL    : ${url}`);
  console.log(`    CI/CD  : Cek GitLab → CI/CD → Pipelines`);
  console.log(`    ⏰ GitLab CI akan otomatis build & deploy.`);
  sep();
  console.log('');

  // Backmerge reminder
  if (!isStaging) {
    console.log('⚠️  PENTING: Jangan lupa backmerge ke dev!');
    console.log('   git checkout dev && git merge main && git push origin dev');
    console.log('');
  }
}

// ── Delete Tag ───────────────────────────────────────────────

async function deleteTag() {
  console.log('\n🗑️   HAPUS TAG');
  sep();

  console.log('⏳ Fetching tags dari remote...');
  run('git fetch --tags --force');

  const allTags = getTagsMatching('v*');
  if (allTags.length === 0) {
    console.log('\n   Tidak ada tag untuk dihapus.');
    return;
  }

  // Tampilkan daftar tag dengan nomor
  console.log(`\n   Daftar tag (${allTags.length} total):\n`);
  allTags.forEach((tag, i) => {
    const isRC = tag.includes('-rc.');
    const icon = isRC ? '🧪' : '🟢';
    const date = getTagDate(tag);
    const msg = getTagMessage(tag);
    console.log(`   ${String(i + 1).padStart(3)}. ${icon} ${tag.padEnd(22)} ${date}  ${msg}`);
  });

  console.log('');
  console.log('   💡 Ketik nomor tag yang ingin dihapus.');
  console.log('   💡 Pisahkan dengan koma untuk hapus beberapa. Contoh: 1,2,3');
  console.log('   💡 Ketik "all-rc" untuk hapus semua tag RC.');
  console.log('');

  const input = await ask('🗑️  Pilih tag (nomor/all-rc/batal): ');

  if (!input || input.toLowerCase() === 'batal' || input.toLowerCase() === 'cancel') {
    console.log('❌ Dibatalkan.');
    return;
  }

  let tagsToDelete = [];

  if (input.toLowerCase() === 'all-rc') {
    tagsToDelete = allTags.filter(t => t.includes('-rc.'));
    if (tagsToDelete.length === 0) {
      console.log('\n   Tidak ada tag RC untuk dihapus.');
      return;
    }
  } else {
    const nums = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    for (const n of nums) {
      if (n >= 1 && n <= allTags.length) {
        tagsToDelete.push(allTags[n - 1]);
      } else {
        console.log(`\n⚠️  Nomor ${n} tidak valid (harus 1-${allTags.length})`);
        return;
      }
    }
  }

  if (tagsToDelete.length === 0) {
    console.log('\n❌ Tidak ada tag yang dipilih.');
    return;
  }

  // Tampilkan konfirmasi
  console.log('');
  sep();
  console.log(`⚠️  Tag yang akan DIHAPUS (${tagsToDelete.length}):`);
  console.log('');
  for (const t of tagsToDelete) {
    const icon = t.includes('-rc.') ? '🧪' : '🟢';
    console.log(`   ${icon} ${t}  —  ${getTagMessage(t)}`);
  }
  sep();

  // Cek apakah ada tag production
  const hasProdTag = tagsToDelete.some(t => !t.includes('-'));
  if (hasProdTag) {
    console.log('\n🚨 PERHATIAN: Kamu akan menghapus tag PRODUCTION!');
    console.log('   Ini tidak akan rollback deployment, tapi tag akan hilang.');
  }

  // Pilihan scope hapus
  console.log('\n📍 Hapus dari mana?');
  console.log('   1. Lokal saja');
  console.log('   2. Remote (GitLab) saja');
  console.log('   3. Keduanya (lokal + remote)');
  console.log('');

  const scope = await ask('Pilih (1/2/3): ');
  if (!['1', '2', '3'].includes(scope)) {
    console.log('❌ Dibatalkan.');
    return;
  }

  const scopeLabel = scope === '1' ? 'LOKAL' : scope === '2' ? 'REMOTE' : 'LOKAL + REMOTE';
  const confirm = await ask(`\n🗑️  Hapus ${tagsToDelete.length} tag dari ${scopeLabel}? (yes/no): `);
  if (confirm.toLowerCase() !== 'yes') {
    console.log('❌ Dibatalkan.');
    return;
  }

  console.log('\n⏳ Menghapus tag...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const tag of tagsToDelete) {
    console.log(`   🗑️  ${tag}...`);

    // Hapus dari remote
    if (scope === '2' || scope === '3') {
      try {
        execSync(`git push origin --delete ${tag}`, { encoding: 'utf-8', stdio: 'pipe' });
        console.log(`      ✅ Remote dihapus`);
      } catch (e) {
        const errMsg = e.stderr ? e.stderr.toString().trim() : 'unknown error';
        if (errMsg.includes('not found') || errMsg.includes('does not exist')) {
          console.log(`      ⚠️  Remote: tag tidak ditemukan (mungkin sudah dihapus)`);
        } else {
          console.log(`      ❌ Remote gagal: ${errMsg.split('\n')[0]}`);
          errorCount++;
        }
      }
    }

    // Hapus dari lokal
    if (scope === '1' || scope === '3') {
      try {
        execSync(`git tag -d ${tag}`, { encoding: 'utf-8', stdio: 'pipe' });
        console.log(`      ✅ Lokal dihapus`);
      } catch (e) {
        const errMsg = e.stderr ? e.stderr.toString().trim() : 'unknown error';
        if (errMsg.includes('not found')) {
          console.log(`      ⚠️  Lokal: tag tidak ditemukan`);
        } else {
          console.log(`      ❌ Lokal gagal: ${errMsg.split('\n')[0]}`);
          errorCount++;
        }
      }
    }

    successCount++;
  }

  console.log('');
  sep();
  if (errorCount === 0) {
    console.log(`✅  ${successCount} tag berhasil dihapus dari ${scopeLabel}!`);
  } else {
    console.log(`⚠️  Selesai: ${successCount - errorCount} berhasil, ${errorCount} gagal.`);
  }
  sep();
  console.log('');
}

// ── Interactive Menu ─────────────────────────────────────────

async function showMenu() {
  console.log('');
  console.log('🚀  SUPERCONTACT WEB — Deploy Manager');
  sep();
  console.log('  1. 📊  Cek status deployment');
  console.log('  2. 🧪  Deploy ke STAGING  (dev → staging + tag RC)');
  console.log('  3. 🟢  Deploy ke PRODUCTION  (staging → main + tag rilis)');
  console.log('  4. 🔥  HOTFIX ke STAGING  (push langsung, tanpa tag)');
  console.log('  5. 🔥  HOTFIX ke PRODUCTION  (push langsung, tanpa tag)');
  console.log('  6. 🏷️   Lihat semua tag');
  console.log('  7. 🗑️   Hapus tag');
  console.log('  8. ❌  Keluar');
  sep();

  const choice = await ask('\nPilih (1-8): ');

  switch (choice) {
    case '1':
      run('git fetch --tags --force');
      showStatus();
      showTags('all');
      break;
    case '2':
      await deployStaging();
      break;
    case '3':
      await deployProd();
      break;
    case '4':
      await deployHotfix('staging');
      break;
    case '5':
      await deployHotfix('production');
      break;
    case '6':
      run('git fetch --tags --force');
      showTags('all');
      break;
    case '7':
      await deleteTag();
      break;
    case '8':
      console.log('👋 Bye!');
      break;
    default:
      console.log('❌ Pilihan tidak valid.');
  }
}

// ── Main ─────────────────────────────────────────────────────

async function main() {
  const arg = process.argv[2] || 'menu';

  switch (arg) {
    case 'status':
      run('git fetch --tags --force');
      showStatus();
      showTags('all');
      break;
    case 'staging':
      await deployStaging();
      break;
    case 'prod':
    case 'production':
      await deployProd();
      break;
    case 'hotfix-staging':
      await deployHotfix('staging');
      break;
    case 'hotfix-prod':
    case 'hotfix-production':
      await deployHotfix('production');
      break;
    case 'staging-tags':
      run('git fetch --tags --force');
      showStatus();
      showTags('staging');
      break;
    case 'prod-tags':
      run('git fetch --tags --force');
      showStatus();
      showTags('prod');
      break;
    case 'tags':
      run('git fetch --tags --force');
      showTags('all');
      break;
    case 'delete-tag':
    case 'delete':
      await deleteTag();
      break;
    case 'menu':
    default:
      await showMenu();
      break;
  }
}

main().catch(console.error);
