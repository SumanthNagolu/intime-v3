import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const { db } = await import('../src/lib/db');
const { leadStrategies } = await import('../src/lib/db/schema/strategy');

async function check() {
  const strategies = await db.select().from(leadStrategies);
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║           LEAD STRATEGIES PERSISTED IN DATABASE                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('\n📊 Total strategies found:', strategies.length);
  
  strategies.forEach(s => {
    console.log('\n' + '═'.repeat(60));
    console.log(`📋 Lead ID: ${s.leadId}`);
    console.log('─'.repeat(60));
    console.log('📝 Strategy Notes:', s.strategyNotes || '(empty)');
    console.log('🎯 Value Proposition:', s.valueProposition || '(empty)');
    console.log('\n💬 Talking Points:');
    if (Array.isArray(s.talkingPoints) && s.talkingPoints.length > 0) {
      (s.talkingPoints as Array<Record<string, unknown>>).forEach((tp, i) => {
        console.log(`   ${i + 1}. ${tp.title}: ${tp.description}`);
      });
    } else {
      console.log('   (none)');
    }
    console.log('\n👥 Stakeholders:');
    if (Array.isArray(s.stakeholders) && s.stakeholders.length > 0) {
      (s.stakeholders as Array<Record<string, unknown>>).forEach(sh => {
        console.log(`   • ${sh.name} (${sh.role}) - Influence: ${sh.influence}, Stance: ${sh.stance}`);
      });
    } else {
      console.log('   (none)');
    }
    console.log('\n⚠️ Objections:');
    if (Array.isArray(s.objections) && s.objections.length > 0) {
      (s.objections as Array<Record<string, unknown>>).forEach(obj => {
        console.log(`   ❓ ${obj.objection}`);
        console.log(`   ✅ ${obj.response}`);
      });
    } else {
      console.log('   (none)');
    }
    console.log('\n⚔️ Competitors:');
    if (Array.isArray(s.competitors) && s.competitors.length > 0) {
      (s.competitors as Array<Record<string, unknown>>).forEach(c => {
        console.log(`   📌 ${c.name}`);
        const theirStrengths = Array.isArray(c.theirStrengths) ? c.theirStrengths.join(', ') : '';
        const ourAdvantages = Array.isArray(c.ourAdvantages) ? c.ourAdvantages.join(', ') : '';
        console.log(`      Their Strengths: ${theirStrengths || '(none)'}`);
        console.log(`      Our Advantages: ${ourAdvantages || '(none)'}`);
      });
    } else {
      console.log('   (none)');
    }
    console.log('\n📅 Created:', s.createdAt?.toISOString());
    console.log('📅 Updated:', s.updatedAt?.toISOString());
  });
  
  console.log('\n' + '═'.repeat(60));
  console.log('✅ All data above is persisted in the database!');
  process.exit(0);
}

check();














