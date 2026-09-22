import { useQuery } from '@tanstack/react-query';
import { mastersApi } from '../api/masters.api';

import { usersService } from '@/features/users/api/users.api';
import { teamsService } from '@/features/teams/api/teams.api';
import { queryKeys, cacheConfig } from '@/api/queryKeys';

export const useStatuses      = () => useQuery({ queryKey: queryKeys.masters.statuses(),     queryFn: mastersApi.getStatuses,     ...cacheConfig.STATIC  });
export const usePriorities    = () => useQuery({ queryKey: queryKeys.masters.priorities(),   queryFn: mastersApi.getPriorities,   ...cacheConfig.STATIC  });
export const useRolesLookup   = () => useQuery({ queryKey: queryKeys.masters.roles(),        queryFn: mastersApi.getRoles,        ...cacheConfig.STATIC  });
export const useUserStatuses  = () => useQuery({ queryKey: queryKeys.masters.userStatuses(), queryFn: mastersApi.getUserStatuses, ...cacheConfig.STATIC  });
export const useSkillsLookup  = () => useQuery({ queryKey: queryKeys.masters.skills(),       queryFn: mastersApi.getSkills,       ...cacheConfig.STATIC  });

export const useMasterLookups = (category: string) => 
    useQuery({ queryKey: queryKeys.masters.lookups(category), queryFn: () => mastersApi.getLookups(category), ...cacheConfig.STATIC });

export const useUsersDropdown = () =>
    useQuery({ queryKey: queryKeys.users.dropdown(), queryFn: () => usersService.getUsers(0, 500), select: (res) => res.items, ...cacheConfig.FREQUENT });

export const useTeamsDropdown = () =>
    useQuery({ queryKey: queryKeys.teams.dropdown(), queryFn: () => teamsService.getTeams(0, 500),  ...cacheConfig.FREQUENT });

