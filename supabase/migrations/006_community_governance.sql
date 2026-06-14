-- ==========================================
-- PHASE 11B: COMMUNITY GOVERNANCE
-- ==========================================
-- Purpose: Decentralized community management, isolated from platform RBAC
-- Roles: owner, moderator, editor, member
-- ==========================================

-- 1. COMMUNITIES TABLE
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT, -- Owner cannot be casually removed
  status VARCHAR(50) DEFAULT 'active', -- active, archived, banned
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE communities IS 'Isolated community ecosystems';
COMMENT ON COLUMN communities.slug IS 'Lowercase unique identifier for community routing';
COMMENT ON COLUMN communities.owner_id IS 'Platform user who is the sole owner. Protected from deletion if they own communities.';

CREATE INDEX idx_communities_slug ON communities(slug);
CREATE INDEX idx_communities_owner ON communities(owner_id);
CREATE INDEX idx_communities_status ON communities(status) WHERE status = 'active';


-- 2. COMMUNITY_SETTINGS TABLE
CREATE TABLE IF NOT EXISTS community_settings (
  community_id UUID PRIMARY KEY REFERENCES communities(id) ON DELETE CASCADE,
  allow_public_join BOOLEAN DEFAULT true,
  require_approval BOOLEAN DEFAULT false,
  allow_member_posts BOOLEAN DEFAULT true,
  allow_member_comments BOOLEAN DEFAULT true,
  allow_invites BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE community_settings IS 'Configuration settings for community access and permissions';


-- 3. COMMUNITY_MEMBERS TABLE
CREATE TABLE IF NOT EXISTS community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member', -- owner, moderator, editor, member
  status VARCHAR(50) DEFAULT 'active', -- active, suspended, banned
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(community_id, user_id)
);

COMMENT ON TABLE community_members IS 'Decentralized RBAC members mapping for communities';
COMMENT ON COLUMN community_members.role IS 'Strict ENUM emulation: owner, moderator, editor, member';

CREATE INDEX idx_community_members_comm ON community_members(community_id);
CREATE INDEX idx_community_members_user ON community_members(user_id);
CREATE INDEX idx_community_members_role ON community_members(community_id, role);


-- 4. COMMUNITY_INVITATIONS TABLE
CREATE TABLE IF NOT EXISTS community_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  token VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, declined, expired
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE community_invitations IS 'Invitations to join a community with a specific role';

CREATE INDEX idx_community_invitations_token ON community_invitations(token);
CREATE INDEX idx_community_invitations_email ON community_invitations(invitee_email);
CREATE INDEX idx_community_invitations_comm ON community_invitations(community_id, status);

-- ==========================================
-- END MIGRATION
-- ==========================================
