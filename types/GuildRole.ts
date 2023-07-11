type Requirement = {
  id: number;
  type: string;
  chain: string;
  address: string | null;
  data: {
    minAmount?: number;
    id?: string;
    min?: string;
  };
};

type GuildRole = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  logic: string;
  anyOfNum: null | number;
  guildId: number;
  requirements: Requirement[];
  members: string[];
  rolePlatforms: any[];
};
export default GuildRole;
