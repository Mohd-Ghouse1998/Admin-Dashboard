import axiosInstance from '@/api/axios';

// Current role management
let currentRole: 'CPO' | 'EMSP' | null = null;

const OCPIApiService = {
  // 1. Role Management
  roles: {
    getCurrent: async () => {
      const { data } = await axiosInstance.get('/api/ocpi/user-role/');
      currentRole = data.active_role;
      return data;
    },
    
    switchRole: async (role: 'CPO' | 'EMSP') => {
      const { data } = await axiosInstance.put('/api/ocpi/user-role/', { role });
      currentRole = role;
      return data;
    },
    
    clearRole: async () => {
      const { data } = await axiosInstance.delete('/api/ocpi/user-role/');
      currentRole = null;
      return data;
    }
  },
  
  // 2. Common APIs (Role-independent)
  common: {
    // 2.1 Dashboard
    dashboard: {
      getConnections: () => axiosInstance.get('/api/ocpi/dashboard/connections/'),
      getCPO: () => axiosInstance.get('/api/ocpi/dashboard/cpo/'),
      getEMSP: () => axiosInstance.get('/api/ocpi/dashboard/emsp/'),
    },
    
    // 2.2 Connections
    connections: {
      getAll: () => axiosInstance.get('/api/ocpi/connections/'),
      getById: (id: string) => axiosInstance.get(`/api/ocpi/connections/${id}/`),
      create: (data: any) => axiosInstance.post('/api/ocpi/connections/', data),
      update: (id: string, data: any) => axiosInstance.put(`/api/ocpi/connections/${id}/`, data),
      delete: (id: string) => axiosInstance.delete(`/api/ocpi/connections/${id}/`),
      register: (data: any) => axiosInstance.post('/api/ocpi/connections/register/', data),
      // For accessing external OCPI endpoints via proxy
      getExternalData: (url: string) => axiosInstance.get('/api/ocpi/external', { params: { url } }),
      // Test a connection
      test: (id: string) => axiosInstance.post(`/api/ocpi/connections/${id}/test`),
    },
    
    // 2.3 Resource Management
    resources: {
      // Parties
      parties: {
        getAll: () => axiosInstance.get('/api/ocpi/api/parties/'),
        getById: (id: string) => axiosInstance.get(`/api/ocpi/api/parties/${id}/`),
        create: (data: any) => axiosInstance.post('/api/ocpi/api/parties/', data),
        update: (id: string, data: any) => axiosInstance.put(`/api/ocpi/api/parties/${id}/`, data),
        delete: (id: string) => axiosInstance.delete(`/api/ocpi/api/parties/${id}/`),
      },
      
      // Locations
      locations: {
        getAll: () => axiosInstance.get('/api/ocpi/api/locations/'),
        getById: (id: string) => axiosInstance.get(`/api/ocpi/api/locations/${id}/`),
        create: (data: any) => axiosInstance.post('/api/ocpi/api/locations/', data),
        update: (id: string, data: any) => axiosInstance.put(`/api/ocpi/api/locations/${id}/`, data),
        delete: (id: string) => axiosInstance.delete(`/api/ocpi/api/locations/${id}/`),
        mapChargers: (data: any) => axiosInstance.post('/api/ocpi/locations/map-chargers/', data),
      },
      
      // EVSEs
      evses: {
        getAll: () => axiosInstance.get('/api/ocpi/api/evses/'),
        getById: (id: string) => axiosInstance.get(`/api/ocpi/api/evses/${id}/`),
        create: (data: any) => axiosInstance.post('/api/ocpi/api/evses/', data),
        update: (id: string, data: any) => axiosInstance.put(`/api/ocpi/api/evses/${id}/`, data),
        delete: (id: string) => axiosInstance.delete(`/api/ocpi/api/evses/${id}/`),
        getByLocation: (locationId: string) => axiosInstance.get(`/api/ocpi/api/locations/${locationId}/evses/`),
      },
      
      // Connectors
      connectors: {
        getAll: () => axiosInstance.get('/api/ocpi/api/connectors/'),
        getById: (id: string) => axiosInstance.get(`/api/ocpi/api/connectors/${id}/`),
        create: (data: any) => axiosInstance.post('/api/ocpi/api/connectors/', data),
        update: (id: string, data: any) => axiosInstance.put(`/api/ocpi/api/connectors/${id}/`, data),
        delete: (id: string) => axiosInstance.delete(`/api/ocpi/api/connectors/${id}/`),
      },
      
      // Generic tariffs
      tariffs: {
        getAll: () => axiosInstance.get('/api/ocpi/api/tariffs/'),
        getById: (id: string) => axiosInstance.get(`/api/ocpi/api/tariffs/${id}/`),
        create: (data: any) => axiosInstance.post('/api/ocpi/api/tariffs/', data),
        update: (id: string, data: any) => axiosInstance.put(`/api/ocpi/api/tariffs/${id}/`, data),
        delete: (id: string) => axiosInstance.delete(`/api/ocpi/api/tariffs/${id}/`),
      },
      
      // Sessions
      sessions: {
        getAll: (params?: any) => axiosInstance.get('/api/ocpi/api/sessions/', { params }),
        getById: (id: string) => axiosInstance.get(`/api/ocpi/api/sessions/${id}/`),
        create: (data: any) => axiosInstance.post('/api/ocpi/api/sessions/', data),
        update: (id: string, data: any) => axiosInstance.put(`/api/ocpi/api/sessions/${id}/`, data),
      },
      
      // CDRs
      cdrs: {
        getAll: () => axiosInstance.get('/api/ocpi/api/cdrs/'),
        getById: (id: string) => axiosInstance.get(`/api/ocpi/api/cdrs/${id}/`),
      },
      
      // Tokens
      tokens: {
        getAll: () => axiosInstance.get('/api/ocpi/api/tokens/'),
        getById: (id: string) => axiosInstance.get(`/api/ocpi/api/tokens/${id}/`),
        create: (data: any) => axiosInstance.post('/api/ocpi/api/tokens/', data),
        update: (id: string, data: any) => axiosInstance.put(`/api/ocpi/api/tokens/${id}/`, data),
        delete: (id: string) => axiosInstance.delete(`/api/ocpi/api/tokens/${id}/`),
        validate: (token: string) => axiosInstance.post('/api/ocpi/api/tokens/validate/', { token }),
      },
      
      // Commands
      commands: {
        getAll: () => axiosInstance.get('/api/ocpi/api/commands/'),
        getById: (id: string) => axiosInstance.get(`/api/ocpi/api/commands/${id}/`),
        create: (data: any) => axiosInstance.post('/api/ocpi/api/commands/', data),
        update: (id: string, data: any) => axiosInstance.put(`/api/ocpi/api/commands/${id}/`, data),
        stopSession: (sessionId: string) => axiosInstance.post('/api/ocpi/commands/stop_session', { session_id: sessionId }),
      },
    },
    
    // 2.4 Sync
    sync: {
      getStatus: () => axiosInstance.get('/api/ocpi/sync/status/'),
      trigger: () => axiosInstance.post('/api/ocpi/sync/trigger/'),
    },
  },
  
  // 3. CPO (Charge Point Operator) specific endpoints
  cpo: {
    // 3.1 Dashboard
    dashboard: {
      getStats: () => axiosInstance.get('/api/ocpi/dashboard/cpo/'),
    },
    tariffs: {
      getAll: () => axiosInstance.get('/api/ocpi/cpo/tariffs/'),
      getById: (id: string) => axiosInstance.get(`/api/ocpi/cpo/tariffs/${id}/`),
      create: (data: any) => axiosInstance.post('/api/ocpi/cpo/tariffs/', data),
      update: (id: string, data: any) => axiosInstance.put(`/api/ocpi/cpo/tariffs/${id}/`, data),
      delete: (id: string) => axiosInstance.delete(`/api/ocpi/cpo/tariffs/${id}/`),
    },
    
    sessions: {
      getAll: (params?: any) => axiosInstance.get('/api/ocpi/cpo/sessions/', { params }),
      getById: (id: string | number) => {
        return axiosInstance.get(`/api/ocpi/cpo/sessions/${id}/`);
      },
      getMeterValues: (id: string) => axiosInstance.get(`/api/ocpi/cpo/sessions/${id}/meter_values/`),
      getStatistics: (params?: any) => axiosInstance.get('/api/ocpi/cpo/sessions/statistics/', { params }),
    },
    
    activeSessions: {
      getAll: () => axiosInstance.get('/api/ocpi/cpo/active-sessions/'),
    },
    
    locations: {
      getAll: () => axiosInstance.get('/api/ocpi/cpo/locations/'),
      getById: (id: string) => axiosInstance.get(`/api/ocpi/cpo/locations/${id}/`),
    },
    
    cdrs: {
      getAll: (params?: any) => axiosInstance.get('/api/ocpi/cpo/cdrs/', { params }),
      getById: (id: string) => axiosInstance.get(`/api/ocpi/cpo/cdrs/${id}/`),
      export: (params?: any) => axiosInstance.get('/api/ocpi/cpo/cdrs/export/', { params, responseType: 'blob' }),
      getStatistics: (params?: any) => axiosInstance.get('/api/ocpi/cpo/cdrs/statistics/', { params }),
      generateInvoice: (id: string | number) => axiosInstance.post(`/api/ocpi/cpo/cdrs/${id}/invoice/`),
    },
    
    tokens: {
      getAll: (params?: any) => axiosInstance.get('/api/ocpi/cpo/tokens/', { params }),
      getById: (id: string) => axiosInstance.get(`/api/ocpi/cpo/tokens/${id}/`),
      validate: (data: any) => axiosInstance.post('/api/ocpi/cpo/tokens/validate/', data),
      authorizeToken: (id: string) => axiosInstance.post(`/api/ocpi/cpo/tokens/${id}/authorize/`),
    },
    
    commands: {
      getAll: (params?: any, config?: any) => axiosInstance.get('/api/ocpi/cpo/commands/', { ...config, params }),
      getById: (id: string, config?: any) => axiosInstance.get(`/api/ocpi/cpo/commands/${id}/`, config),
      getStatistics: (config?: any) => axiosInstance.get('/api/ocpi/cpo/commands/statistics/', config),
      stopSession: (data: { session_id: string }, config?: any) => axiosInstance.post('/api/ocpi/cpo/commands/stop_session/', data, config),
      unlockConnector: (data: { location_id: string, evse_uid: string, connector_id: string }, config?: any) => 
        axiosInstance.post('/api/ocpi/cpo/commands/unlock_connector/', data, config),
      reserveNow: (data: any, config?: any) => axiosInstance.post('/api/ocpi/cpo/commands/reserve_now/', data, config),
      cancelReservation: (data: { reservation_id: string }, config?: any) => 
        axiosInstance.post('/api/ocpi/cpo/commands/cancel_reservation/', data, config),
    },
  },
  
  // 4. EMSP (E-Mobility Service Provider) specific endpoints
  emsp: {
    // 4.1 Dashboard
    dashboard: {
      getStats: () => axiosInstance.get('/api/ocpi/dashboard/emsp/'),
    },
    tariffs: {
      getAll: () => axiosInstance.get('/api/ocpi/emsp/tariffs/'),
      getById: (id: string) => axiosInstance.get(`/api/ocpi/emsp/tariffs/${id}/`),
      create: (data: any) => axiosInstance.post('/api/ocpi/emsp/tariffs/', data),
      update: (id: string, data: any) => axiosInstance.put(`/api/ocpi/emsp/tariffs/${id}/`, data),
      delete: (id: string) => axiosInstance.delete(`/api/ocpi/emsp/tariffs/${id}/`),
    },
    
    locations: {
      getAll: (params?: any) => axiosInstance.get('/api/ocpi/emsp/locations/', { params }),
      getById: (id: string) => axiosInstance.get(`/api/ocpi/emsp/locations/${id}/`),
    },
    
    sessions: {
      getAll: (params?: any) => axiosInstance.get('/api/ocpi/emsp/sessions/', { params }),
      getById: (id: string) => axiosInstance.get(`/api/ocpi/emsp/sessions/${id}/`),
      start: (data: any) => axiosInstance.post('/api/ocpi/emsp/sessions/', { action: 'START', ...data }),
      stop: (data: any) => axiosInstance.post('/api/ocpi/emsp/sessions/', { action: 'STOP', ...data }),
    },
    
    cdrs: {
      getAll: (params?: any) => axiosInstance.get('/api/ocpi/emsp/cdrs/', { params }),
      getById: (id: string) => axiosInstance.get(`/api/ocpi/emsp/cdrs/${id}/`),
      export: (params?: any) => axiosInstance.get('/api/ocpi/emsp/cdrs/export/', { params, responseType: 'blob' }),
      getStatistics: (params?: any) => axiosInstance.get('/api/ocpi/emsp/cdrs/statistics/', { params }),
      generateInvoice: (id: string | number) => axiosInstance.post(`/api/ocpi/emsp/cdrs/${id}/invoice/`),
    },
    
    tokens: {
      getAll: () => axiosInstance.get('/api/ocpi/emsp/tokens/'),
      validate: (data: any) => axiosInstance.post('/api/ocpi/emsp/tokens/validate/', data),
    },
    
    commands: {
      getAll: (params?: any, config?: any) => axiosInstance.get('/api/ocpi/emsp/commands/', { ...config, params }),
      getById: (id: string, config?: any) => axiosInstance.get(`/api/ocpi/emsp/commands/${id}/`, config),
      getStatus: (commandId: string, config?: any) => axiosInstance.get(`/api/ocpi/emsp/commands/${commandId}/status/`, config),
      getStatistics: (config?: any) => axiosInstance.get('/api/ocpi/emsp/commands/statistics/', config),
      startSession: (data: any, config?: any) => axiosInstance.post('/api/ocpi/emsp/commands/start_session/', data, config),
      stopSession: (data: { session_id: string }, config?: any) => axiosInstance.post('/api/ocpi/emsp/commands/stop_session/', data, config),
      unlockConnector: (data: { location_id: string, evse_uid: string, connector_id: string }, config?: any) => 
        axiosInstance.post('/api/ocpi/emsp/commands/unlock_connector/', data, config),
      reserveNow: (data: any, config?: any) => axiosInstance.post('/api/ocpi/emsp/commands/reserve_now/', data, config),
      cancelReservation: (data: { reservation_id: string }, config?: any) => 
        axiosInstance.post('/api/ocpi/emsp/commands/cancel_reservation/', data, config),
    },
    
    reservations: {
      create: (data: any) => axiosInstance.post('/api/ocpi/emsp/reservations/', data),
    },
    
    unlockConnector: (sessionId: string) => axiosInstance.post('/api/ocpi/emsp/unlock/', { session_id: sessionId }),
    
    // Add favorite location
    addFavorite: (data: any) => axiosInstance.post('/api/ocpi/emsp/favorites/', data),
    
    activeSessions: {
      getAll: () => axiosInstance.get('/api/ocpi/emsp/active-sessions/'),
    },
  },
  
  // 5. Role-based helper methods
  getRoleBasedAPI: (resource: string) => {
    if (!currentRole) {
      throw new Error('Role not set. Call roles.getCurrent() first');
    }
    
    return currentRole === 'CPO' 
      ? `/api/ocpi/cpo/${resource}/` 
      : `/api/ocpi/emsp/${resource}/`;
  },
  
  getCommands: (params?: any, config?: any) => {
    if (!currentRole) {
      throw new Error('Role not set. Call roles.getCurrent() first');
    }
    
    return currentRole === 'CPO'
      ? OCPIApiService.cpo.commands.getAll(params, config)
      : OCPIApiService.emsp.commands.getAll(params, config);
  },
  
  getCommandById: (id: string, config?: any) => {
    if (!currentRole) {
      throw new Error('Role not set. Call roles.getCurrent() first');
    }
    
    return currentRole === 'CPO'
      ? OCPIApiService.cpo.commands.getById(id, config)
      : OCPIApiService.emsp.commands.getById(id, config);
  },
  
  getCommandStatistics: (config?: any) => {
    if (!currentRole) {
      throw new Error('Role not set. Call roles.getCurrent() first');
    }
    
    return currentRole === 'CPO'
      ? OCPIApiService.cpo.commands.getStatistics(config)
      : OCPIApiService.emsp.commands.getStatistics(config);
  },
  
  getActiveSessions: () => {
    if (!currentRole) {
      throw new Error('Role not set. Call roles.getCurrent() first');
    }
    
    return currentRole === 'CPO'
      ? OCPIApiService.cpo.activeSessions.getAll()
      : OCPIApiService.emsp.activeSessions.getAll();
  },
  
  getRoleDashboard: () => {
    if (!currentRole) {
      throw new Error('Role not set. Call roles.getCurrent() first');
    }
    
    return currentRole === 'CPO'
      ? OCPIApiService.common.dashboard.getCPO()
      : OCPIApiService.common.dashboard.getEMSP();
  },
  
  getRoleTariffs: () => {
    if (!currentRole) {
      throw new Error('Role not set. Call roles.getCurrent() first');
    }
    
    return currentRole === 'CPO'
      ? OCPIApiService.cpo.tariffs.getAll()
      : OCPIApiService.emsp.tariffs.getAll();
  },
};

export default OCPIApiService;
