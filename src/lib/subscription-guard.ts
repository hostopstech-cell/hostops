import { sql } from "@/lib/db";

export const TRIAL_DAYS = 1;        // 1 day trial
export const GRACE_DAYS = 2;        // 2 days grace for paid subscribers

export interface SubStatus {
  plan: string;
  isOnTrial: boolean;
  trialExpired: boolean;
  subscriptionActive: boolean;
  inGracePeriod: boolean;       // paid plan expired but within 2 days
  accessAllowed: boolean;
  hardBlocked: boolean;          // no access at all
  trialDaysLeft: number;
  trialHoursLeft: number;
  subDaysLeft: number;           // for active subscribers
  subExpiringSoon: boolean;      // last 3 days warning
  trialEndsAt: Date;
  subscriptionEndsAt: Date | null;
}

export async function getSubStatus(ownerId: number): Promise<SubStatus> {
  const rows = await sql`
    SELECT subscription_plan, trial_starts_at, subscription_ends_at
    FROM owners WHERE id = ${ownerId}
  `;
  if (!rows.length) throw new Error("Owner not found");

  const o = rows[0];
  const now = new Date();

  const trialStart = o.trial_starts_at ? new Date(o.trial_starts_at) : new Date();
  const trialEnd = new Date(trialStart);
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);

  const plan = o.subscription_plan || "trial";
  const isOnTrial = plan === "trial";

  const trialMsLeft = trialEnd.getTime() - now.getTime();
  const trialExpired = isOnTrial && trialMsLeft <= 0;
  const trialDaysLeft = isOnTrial ? Math.max(0, Math.ceil(trialMsLeft / (1000*60*60*24))) : 0;
  const trialHoursLeft = isOnTrial ? Math.max(0, Math.ceil(trialMsLeft / (1000*60*60))) : 0;

  const subEndsAt = o.subscription_ends_at ? new Date(o.subscription_ends_at) : null;
  const subscriptionActive = !isOnTrial && subEndsAt !== null && subEndsAt > now;

  // Grace period: paid plan expired within last GRACE_DAYS days
  const graceEnd = subEndsAt ? new Date(subEndsAt.getTime() + GRACE_DAYS * 24*60*60*1000) : null;
  const inGracePeriod = !isOnTrial && !subscriptionActive && graceEnd !== null && now < graceEnd;

  // Sub days left (for active subscribers)
  const subMsLeft = subEndsAt ? subEndsAt.getTime() - now.getTime() : 0;
  const subDaysLeft = subscriptionActive ? Math.max(0, Math.ceil(subMsLeft / (1000*60*60*24))) : 0;
  const subExpiringSoon = subscriptionActive && subDaysLeft <= 3;

  // Access: trial active OR subscription active OR in grace period
  const accessAllowed = (!trialExpired && isOnTrial) || subscriptionActive || inGracePeriod;
  const hardBlocked = !accessAllowed;

  return {
    plan,
    isOnTrial,
    trialExpired,
    subscriptionActive,
    inGracePeriod,
    accessAllowed,
    hardBlocked,
    trialDaysLeft,
    trialHoursLeft,
    subDaysLeft,
    subExpiringSoon,
    trialEndsAt: trialEnd,
    subscriptionEndsAt: subEndsAt,
  };
}
