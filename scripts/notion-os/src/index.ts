import 'dotenv/config';
import { Client } from '@notionhq/client';
import type { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints';

if (!process.env.NOTION_API_KEY) {
  console.error('❌  NOTION_API_KEY is not set. Copy .env.example to .env and fill in your values.');
  process.exit(1);
}
if (!process.env.NOTION_PARENT_PAGE_ID) {
  console.error('❌  NOTION_PARENT_PAGE_ID is not set. Copy .env.example to .env and fill in your values.');
  process.exit(1);
}

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const PARENT_PAGE_ID = process.env.NOTION_PARENT_PAGE_ID;

// ─── Helpers ────────────────────────────────────────────────────────────────

function h1(content: string): BlockObjectRequest {
  return { object: 'block', type: 'heading_1', heading_1: { rich_text: [{ type: 'text', text: { content } }] } };
}

function h2(content: string): BlockObjectRequest {
  return { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content } }] } };
}

function h3(content: string): BlockObjectRequest {
  return { object: 'block', type: 'heading_3', heading_3: { rich_text: [{ type: 'text', text: { content } }] } };
}

function para(content: string): BlockObjectRequest {
  return { object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content } }] } };
}

function paraGray(content: string): BlockObjectRequest {
  return {
    object: 'block', type: 'paragraph',
    paragraph: { rich_text: [{ type: 'text', text: { content }, annotations: { italic: true, color: 'gray' } }] },
  };
}

function callout(content: string, emoji: string, color: BlockObjectRequest extends { type: 'callout' } ? never : string = 'blue_background'): BlockObjectRequest {
  return {
    object: 'block', type: 'callout',
    callout: {
      rich_text: [{ type: 'text', text: { content } }],
      icon: { type: 'emoji', emoji: emoji as any },
      color: color as any,
    },
  };
}

function divider(): BlockObjectRequest {
  return { object: 'block', type: 'divider', divider: {} };
}

function bullet(content: string): BlockObjectRequest {
  return { object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content } }] } };
}

function todo(content: string): BlockObjectRequest {
  return { object: 'block', type: 'to_do', to_do: { rich_text: [{ type: 'text', text: { content } }], checked: false } };
}

function childPage(title: string): BlockObjectRequest {
  return { object: 'block', type: 'child_page', child_page: { title } };
}

function notionUrl(id: string) {
  return `https://www.notion.so/${id.replace(/-/g, '')}`;
}

// ─── Root Page ───────────────────────────────────────────────────────────────

async function createRootPage(parentId: string) {
  const page = await notion.pages.create({
    parent: { type: 'page_id', page_id: parentId },
    icon: { type: 'emoji', emoji: '🏦' },
    properties: {
      title: { title: [{ type: 'text', text: { content: 'DrawingBoard Capital OS' } }] },
    },
    children: [
      callout('Your investment banking operating system — one dashboard, three databases, zero friction.', '⚡', 'blue_background'),
      divider(),
      h2('What lives here'),
      bullet('💼  Advisory Deals — every mandate, its stage, advisor, and next action'),
      bullet('🎯  LP Pipeline — fundraising pipeline for the FoF'),
      bullet('✅  Tasks — deadline-driven actions linked to deals and LPs'),
      bullet('🏠  Daily Dashboard — your morning command center'),
      divider(),
      h2('Daily rhythm'),
      bullet('Open Dashboard every morning'),
      bullet('Check Tasks due today → work through them'),
      bullet('Advance any deal stages that moved'),
      bullet('Update Next Action + Date on anything you touched'),
      bullet('20-min weekly review on Fridays to triage the full pipeline'),
    ],
  });
  return page.id;
}

// ─── Advisory Deals Database ─────────────────────────────────────────────────

async function createAdvisoryDealsDb(rootPageId: string): Promise<string> {
  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: rootPageId },
    icon: { type: 'emoji', emoji: '💼' },
    title: [{ type: 'text', text: { content: 'Advisory Deals' } }],
    properties: {
      'Deal Name': { title: {} },
      'Type': {
        select: {
          options: [
            { name: 'Sell-Side', color: 'blue' },
            { name: 'Buy-Side', color: 'green' },
          ],
        },
      },
      'Stage': {
        select: {
          options: [
            // Shared
            { name: 'Mandate Signed', color: 'yellow' },
            { name: 'Due Diligence', color: 'red' },
            { name: 'Close', color: 'green' },
            // Sell-Side
            { name: 'VDR Prep', color: 'orange' },
            { name: 'Marketing', color: 'blue' },
            { name: 'Internal Diligence', color: 'purple' },
            { name: 'LOI', color: 'pink' },
            // Buy-Side
            { name: 'Target List', color: 'orange' },
            { name: 'Outreach', color: 'blue' },
            { name: 'Introduction', color: 'pink' },
            { name: 'Negotiation', color: 'red' },
          ],
        },
      },
      'Status': {
        select: {
          options: [
            { name: 'Active', color: 'green' },
            { name: 'On Hold', color: 'yellow' },
            { name: 'Closed Won', color: 'blue' },
            { name: 'Closed Lost', color: 'red' },
          ],
        },
      },
      'Company / Target': { rich_text: {} },
      'External Advisor': { rich_text: {} },
      'Priority': {
        select: {
          options: [
            { name: '🔴 High', color: 'red' },
            { name: '🟡 Medium', color: 'yellow' },
            { name: '⚪ Low', color: 'gray' },
          ],
        },
      },
      'Next Action': { rich_text: {} },
      'Next Action Date': { date: {} },
      'Mandate Date': { date: {} },
      'Est. Fee (USD)': { number: { format: 'dollar' } },
      'HubSpot Link': { url: {} },
      'VDR / Drive Link': { url: {} },
    },
  });
  return db.id;
}

// ─── LP Pipeline Database ─────────────────────────────────────────────────────

async function createLpPipelineDb(rootPageId: string): Promise<string> {
  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: rootPageId },
    icon: { type: 'emoji', emoji: '🎯' },
    title: [{ type: 'text', text: { content: 'LP Pipeline' } }],
    properties: {
      'LP Name': { title: {} },
      'Organization': { rich_text: {} },
      'Type': {
        select: {
          options: [
            { name: 'Family Office', color: 'purple' },
            { name: 'UHNWI', color: 'blue' },
            { name: 'Institutional', color: 'green' },
            { name: 'Endowment', color: 'orange' },
            { name: 'Foundation', color: 'pink' },
            { name: 'HNW Individual', color: 'yellow' },
          ],
        },
      },
      'Stage': {
        select: {
          options: [
            { name: 'Identified', color: 'gray' },
            { name: 'First Touch', color: 'yellow' },
            { name: 'Meeting Scheduled', color: 'orange' },
            { name: 'Meeting Done', color: 'blue' },
            { name: 'Materials Sent', color: 'purple' },
            { name: 'Follow-up', color: 'pink' },
            { name: 'Soft Circle', color: 'green' },
            { name: 'Committed', color: 'green' },
            { name: 'Closed', color: 'blue' },
            { name: 'Passed', color: 'red' },
          ],
        },
      },
      'Source': {
        select: {
          options: [
            { name: 'LinkedIn', color: 'blue' },
            { name: 'Apollo', color: 'orange' },
            { name: 'In-Person', color: 'green' },
            { name: 'Referral', color: 'purple' },
            { name: 'Conference', color: 'yellow' },
            { name: 'Other', color: 'gray' },
          ],
        },
      },
      'Target Commitment (USD)': { number: { format: 'dollar' } },
      'Next Action': { rich_text: {} },
      'Next Action Date': { date: {} },
      'First Contact Date': { date: {} },
      'Last Interaction': { date: {} },
      'HubSpot Link': { url: {} },
      'LinkedIn URL': { url: {} },
      'Country': { rich_text: {} },
    },
  });
  return db.id;
}

// ─── Tasks Database ───────────────────────────────────────────────────────────

async function createTasksDb(rootPageId: string, dealDbId: string, lpDbId: string): Promise<string> {
  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: rootPageId },
    icon: { type: 'emoji', emoji: '✅' },
    title: [{ type: 'text', text: { content: 'Tasks' } }],
    properties: {
      'Task': { title: {} },
      'Status': {
        select: {
          options: [
            { name: 'Not Started', color: 'gray' },
            { name: 'In Progress', color: 'blue' },
            { name: 'Done', color: 'green' },
            { name: 'Blocked', color: 'red' },
          ],
        },
      },
      'Priority': {
        select: {
          options: [
            { name: '🔴 High', color: 'red' },
            { name: '🟡 Medium', color: 'yellow' },
            { name: '⚪ Low', color: 'gray' },
          ],
        },
      },
      'Due Date': { date: {} },
      'Related Deal': {
        relation: { database_id: dealDbId, single_property: {} },
      },
      'Related LP': {
        relation: { database_id: lpDbId, single_property: {} },
      },
      'Context': { rich_text: {} },
    },
  });
  return db.id;
}

// ─── Daily Dashboard ──────────────────────────────────────────────────────────

async function createDashboard(rootPageId: string, dealDbId: string, lpDbId: string, taskDbId: string) {
  const page = await notion.pages.create({
    parent: { type: 'page_id', page_id: rootPageId },
    icon: { type: 'emoji', emoji: '🏠' },
    properties: {
      title: { title: [{ type: 'text', text: { content: 'Daily Dashboard' } }] },
    },
    children: [
      callout('Open this page every morning. Update stages, clear tasks, set next actions.', '☀️', 'yellow_background'),
      divider(),
      h2('✅ Tasks — Due Today'),
      paraGray('→ Type /linked and select "Tasks" database. Filter: Due Date = Today, Status ≠ Done. Show: Task, Priority, Related Deal, Related LP.'),
      divider(),
      h2('💼 Active Deals'),
      paraGray('→ Type /linked and select "Advisory Deals" database. Filter: Status = Active. Show: Deal Name, Type, Stage, Next Action, Next Action Date, External Advisor.'),
      divider(),
      h2('🎯 LP Follow-Ups This Week'),
      paraGray('→ Type /linked and select "LP Pipeline" database. Filter: Next Action Date is this week, Stage ≠ Closed, Stage ≠ Passed. Show: LP Name, Organization, Stage, Next Action, Next Action Date.'),
      divider(),
      h2('📋 Weekly Review (Fridays, 20 min)'),
      todo('Advance deal stages that moved this week'),
      todo('Update Next Action + Date on every active deal'),
      todo('Move stale LP prospects forward or mark Passed'),
      todo('Clear Done tasks; reprioritize blocked ones'),
      todo('Check Est. Fee pipeline — anything close to closing?'),
      divider(),
      callout(
        'How to activate the dashboard views above:\n1. Click below each section heading\n2. Type /linked view\n3. Select the relevant database\n4. Apply the filter described in gray text\n5. Hide the gray instruction line when done',
        '💡',
        'gray_background',
      ),
    ],
  });
  return page.id;
}

// ─── Deal Templates ───────────────────────────────────────────────────────────

const advisorViewBlocks: BlockObjectRequest[] = [
  callout("This page is for the External Advisor. Share ONLY this sub-page — not the parent deal page.\nNotion share: top-right 'Share' → 'Copy link'. Set to 'Anyone with the link can view'.", '🔒', 'blue_background'),
  divider(),
  h2('Deal Overview'),
  para('Client:\nSector:\nMandate Date:\nBrief Description:'),
  divider(),
  h2('📊 Current Stage'),
  para(''),
  divider(),
  h2('📋 Your Responsibilities'),
  todo(''),
  divider(),
  h2('📁 Shared Documents'),
  bullet('Document 1: '),
  bullet('Document 2: '),
];

async function createSellSideTemplate(dealDbId: string) {
  const page = await notion.pages.create({
    parent: { type: 'database_id', database_id: dealDbId },
    icon: { type: 'emoji', emoji: '📋' },
    properties: {
      'Deal Name': { title: [{ type: 'text', text: { content: '📋 TEMPLATE — Sell-Side' } }] },
      'Type': { select: { name: 'Sell-Side' } },
      'Stage': { select: { name: 'Mandate Signed' } },
      'Status': { select: { name: 'Active' } },
    },
    children: [
      callout('Duplicate this page for each new sell-side mandate. Fill in the fields above and delete this callout.', '📋', 'gray_background'),
      divider(),
      h1('Deal Overview'),
      para('Client:\nSector:\nMandate Date:\nBrief Description:'),
      divider(),
      h2('📊 Stage Progress'),
      todo('Mandate Signed'),
      todo('VDR Prep'),
      todo('Marketing'),
      todo('Internal Diligence'),
      todo('LOI'),
      todo('Due Diligence'),
      todo('Close'),
      divider(),
      h2('👥 Key Contacts'),
      para('External Advisor:\nClient Primary:\nClient Secondary:\nClient Legal:\nOur Legal:'),
      divider(),
      h2('📁 Documents'),
      bullet('VDR Link: '),
      bullet('Information Memorandum: '),
      bullet('Financial Model: '),
      bullet('NDA Template: '),
      bullet('Engagement Letter: '),
      divider(),
      h2('📝 Call & Meeting Log'),
      para('Date  |  Attendees  |  Summary  |  Next Step'),
      divider(),
      h2('✅ Open Items'),
      para('Track deal-specific open items here. Use the Tasks database for deadline-driven work.'),
      divider(),
      childPage('🤝 Advisor View'),
    ],
  });

  // Populate the Advisor View sub-page
  const blocks = await notion.blocks.children.list({ block_id: page.id });
  const advisorBlock = blocks.results.find((b: any) => b.type === 'child_page' && b.child_page?.title === '🤝 Advisor View');
  if (advisorBlock) {
    await notion.blocks.children.append({ block_id: advisorBlock.id, children: advisorViewBlocks });
  }
  return page.id;
}

async function createBuySideTemplate(dealDbId: string) {
  const page = await notion.pages.create({
    parent: { type: 'database_id', database_id: dealDbId },
    icon: { type: 'emoji', emoji: '📋' },
    properties: {
      'Deal Name': { title: [{ type: 'text', text: { content: '📋 TEMPLATE — Buy-Side' } }] },
      'Type': { select: { name: 'Buy-Side' } },
      'Stage': { select: { name: 'Mandate Signed' } },
      'Status': { select: { name: 'Active' } },
    },
    children: [
      callout('Duplicate this page for each new buy-side mandate. Fill in the fields above and delete this callout.', '📋', 'gray_background'),
      divider(),
      h1('Deal Overview'),
      para('Acquirer (Client):\nSector Focus:\nAcquisition Criteria:\nTarget Size Range:\nMandate Date:'),
      divider(),
      h2('📊 Stage Progress'),
      todo('Mandate Signed'),
      todo('Target List'),
      todo('Outreach'),
      todo('Due Diligence'),
      todo('Introduction'),
      todo('Negotiation'),
      todo('Close'),
      divider(),
      h2('🎯 Target Companies'),
      para('Company  |  Status  |  Contact  |  Notes'),
      divider(),
      h2('👥 Key Contacts'),
      para('External Advisor:\nClient Primary:\nClient Legal:\nOur Legal:'),
      divider(),
      h2('📁 Documents'),
      bullet('Target List (Excel): '),
      bullet('Acquisition Criteria Memo: '),
      bullet('NDA Template: '),
      bullet('LOI Template: '),
      divider(),
      h2('📝 Call & Meeting Log'),
      para('Date  |  Attendees  |  Summary  |  Next Step'),
      divider(),
      h2('✅ Open Items'),
      para('Track deal-specific open items here. Use the Tasks database for deadline-driven work.'),
      divider(),
      childPage('🤝 Advisor View'),
    ],
  });

  const blocks = await notion.blocks.children.list({ block_id: page.id });
  const advisorBlock = blocks.results.find((b: any) => b.type === 'child_page' && b.child_page?.title === '🤝 Advisor View');
  if (advisorBlock) {
    await notion.blocks.children.append({ block_id: advisorBlock.id, children: advisorViewBlocks });
  }
  return page.id;
}

// ─── LP Pipeline Template ──────────────────────────────────────────────────────

async function createLpTemplate(lpDbId: string) {
  await notion.pages.create({
    parent: { type: 'database_id', database_id: lpDbId },
    icon: { type: 'emoji', emoji: '📋' },
    properties: {
      'LP Name': { title: [{ type: 'text', text: { content: '📋 TEMPLATE — LP Record' } }] },
      'Stage': { select: { name: 'Identified' } },
    },
    children: [
      callout('Duplicate this for each new LP prospect. Fill in all database fields at the top, then use this page for notes and history.', '📋', 'gray_background'),
      divider(),
      h2('🧑 Profile Notes'),
      para('Background:\nInvestment mandate:\nTypical ticket size:\nPreferred fund types:\nDecision maker(s):'),
      divider(),
      h2('📝 Interaction Log'),
      para('Date  |  Channel  |  Summary  |  Next Step'),
      divider(),
      h2('📁 Shared Materials'),
      bullet('Teaser: '),
      bullet('PPM / OM: '),
      bullet('Track Record: '),
      bullet('Due Diligence Questionnaire: '),
      divider(),
      h2('⚠️ Objections & Notes'),
      para('Track any concerns or objections raised so you can address them proactively.'),
    ],
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🚀  Building DrawingBoard Capital OS in Notion...\n');

  const rootId = await createRootPage(PARENT_PAGE_ID);
  console.log(`✅  Root page created          ${notionUrl(rootId)}`);

  const dealDbId = await createAdvisoryDealsDb(rootId);
  console.log(`✅  Advisory Deals database    ${notionUrl(dealDbId)}`);

  const lpDbId = await createLpPipelineDb(rootId);
  console.log(`✅  LP Pipeline database       ${notionUrl(lpDbId)}`);

  const taskDbId = await createTasksDb(rootId, dealDbId, lpDbId);
  console.log(`✅  Tasks database             ${notionUrl(taskDbId)}`);

  const dashboardId = await createDashboard(rootId, dealDbId, lpDbId, taskDbId);
  console.log(`✅  Daily Dashboard            ${notionUrl(dashboardId)}`);

  await createSellSideTemplate(dealDbId);
  await createBuySideTemplate(dealDbId);
  console.log(`✅  Deal templates created     (Sell-Side + Buy-Side)`);

  await createLpTemplate(lpDbId);
  console.log(`✅  LP template created`);

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉  Setup complete!

👉  Open your Notion workspace:
    ${notionUrl(rootId)}

📋  3 manual steps to activate the Daily Dashboard:
    1. Open "Daily Dashboard"
    2. Under each section, type /linked view
    3. Select the database + apply the filter in gray text
       (takes ~3 minutes total)

💡  For each new deal:
    - Duplicate "📋 TEMPLATE — Sell-Side" or "Buy-Side" from Advisory Deals
    - Fill in the database properties at top
    - Share the "🤝 Advisor View" sub-page with your external advisor

🔑  Rotate your Notion API key at notion.so/my-integrations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

main().catch((err) => {
  console.error('❌  Setup failed:', err.message ?? err);
  process.exit(1);
});
