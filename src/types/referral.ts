export interface ReferralTeamMember {
  id: number;
  display_name: string;
  phone: string;
  created_at: string;
  total_commission: number;
  total_purchases: number;
}

export interface ReferralLevel {
  level: string;
  commission: string;
  users: number;
  rewards: number;
}

export interface ReferralTeam {
  levels: ReferralLevel[];
  level1Users: ReferralTeamMember[];
  totalUsers: number;
  totalRewards: number;
}

export interface ReferralStats {
  referral_code: string;
  total_referrals: number;
  referral_earnings: number;
  total_referrals_count: number;
  total_commissions_earned: number;
}

export interface ReferralCodeValidation {
  isValid: boolean;
  message: string;
}