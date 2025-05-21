
import React from "react";
import { Route } from "react-router-dom";
import ChargersListPage from "@/modules/chargers/pages/chargers/ChargersListPage";
import ChargerCreatePage from "@/modules/chargers/pages/chargers/ChargerCreatePage";
import ChargerDetailPage from "@/modules/chargers/pages/chargers/ChargerDetailPage";
import ChargerEditPage from "@/modules/chargers/pages/chargers/ChargerEditPage";
import FavoriteChargersListPage from "@/modules/chargers/pages/favorites/FavoriteChargersListPage";
import FavoriteChargerCreatePage from "@/modules/chargers/pages/favorites/FavoriteChargerCreatePage";
import FavoriteChargerDetailPage from "@/modules/chargers/pages/favorites/FavoriteChargerDetailPage";
import FavoriteChargerEditPage from "@/modules/chargers/pages/favorites/FavoriteChargerEditPage";
import ChargerConfigsListPage from "@/modules/chargers/pages/configs/ChargerConfigsListPage";
import ChargerConfigCreatePage from "@/modules/chargers/pages/configs/ChargerConfigCreatePage";
import ChargerConfigDetailPage from "@/modules/chargers/pages/configs/ChargerConfigDetailPage";
import ChargerConfigEditPage from "@/modules/chargers/pages/configs/ChargerConfigEditPage";
import ChargingSessionsListPage from "@/modules/chargers/pages/charging-sessions/ChargingSessionsListPage";
import ChargingSessionCreatePage from "@/modules/chargers/pages/charging-sessions/ChargingSessionCreatePage";
import ChargingSessionDetailPage from "@/modules/chargers/pages/charging-sessions/ChargingSessionDetailPage";
import ChargingSessionEditPage from "@/modules/chargers/pages/charging-sessions/ChargingSessionEditPage";
import RemoteControlPage from "@/modules/chargers/pages/remote-control/RemoteControlPage";
// Import ID Tags pages
import {
  IdTagsListPage,
  IdTagDetailPage,
  IdTagCreatePage,
  IdTagEditPage
} from "@/modules/chargers/pages/id-tags";

// Import Meter Values pages
import MeterValuesListPage from "@/modules/chargers/pages/meter-values/MeterValuesListPage";
import MeterValueDetailPage from "@/modules/chargers/pages/meter-values/MeterValueDetailPage";

// Import Connector pages
import ConnectorsListPage from "@/modules/chargers/pages/connectors/ConnectorsListPage";
import ConnectorDetailPage from "@/modules/chargers/pages/connectors/ConnectorDetailPage";
import ConnectorCreatePage from "@/modules/chargers/pages/connectors/ConnectorCreatePage";
import ConnectorEditPage from "@/modules/chargers/pages/connectors/ConnectorEditPage";

// Import Remote Operations pages
import RemoteStartPage from "@/modules/chargers/pages/remote-operations/RemoteStartPage";
import RemoteStopPage from "@/modules/chargers/pages/remote-operations/RemoteStopPage";
import ResetChargerPage from "@/modules/chargers/pages/remote-operations/ResetChargerPage";
import ChangeAvailabilityPage from "@/modules/chargers/pages/remote-operations/ChangeAvailabilityPage";
import ClearCachePage from "@/modules/chargers/pages/remote-operations/ClearCachePage";
import TriggerMessagePage from "@/modules/chargers/pages/remote-operations/TriggerMessagePage";
import UpdateFirmwarePage from "@/modules/chargers/pages/remote-operations/UpdateFirmwarePage";
import RemoteOperationsDashboard from "@/modules/chargers/pages/remote-operations/RemoteOperationsDashboard";

export const chargerRoutes = (
  <>
    {/* Chargers */}
    <Route path="chargers" element={<ChargersListPage />} />
    <Route path="chargers/create" element={<ChargerCreatePage />} />
    
    {/* Favorite Chargers */}
    <Route path="chargers/favorites" element={<FavoriteChargersListPage />} />
    <Route path="chargers/favorites/create" element={<FavoriteChargerCreatePage />} />
    <Route path="chargers/favorites/:id" element={<FavoriteChargerDetailPage />} />
    <Route path="chargers/favorites/:id/edit" element={<FavoriteChargerEditPage />} />
    
    {/* Charger Configs */}
    <Route path="chargers/configs" element={<ChargerConfigsListPage />} />
    <Route path="chargers/configs/create" element={<ChargerConfigCreatePage />} />
    <Route path="chargers/configs/:id" element={<ChargerConfigDetailPage />} />
    <Route path="chargers/configs/:id/edit" element={<ChargerConfigEditPage />} />
    
    {/* Charging Sessions */}
    <Route path="chargers/charging-sessions" element={<ChargingSessionsListPage />} />
    <Route path="chargers/charging-sessions/create" element={<ChargingSessionCreatePage />} />
    <Route path="chargers/charging-sessions/:id" element={<ChargingSessionDetailPage />} />
    <Route path="chargers/charging-sessions/:id/edit" element={<ChargingSessionEditPage />} />
    
    {/* Remote Control */}
    <Route path="chargers/remote-control" element={<RemoteControlPage />} />
    
    {/* ID Tags Routes */}
    <Route path="chargers/id-tags" element={<IdTagsListPage />} />
    <Route path="chargers/id-tags/create" element={<IdTagCreatePage />} />
    <Route path="chargers/id-tags/:id" element={<IdTagDetailPage />} />
    <Route path="chargers/id-tags/:id/edit" element={<IdTagEditPage />} />
    
    {/* Meter Values Routes */}
    <Route path="chargers/meter-values" element={<MeterValuesListPage />} />
    <Route path="chargers/meter-values/:id" element={<MeterValueDetailPage />} />
    
    {/* Connector Routes */}
    <Route path="chargers/connectors" element={<ConnectorsListPage />} />
    <Route path="chargers/connectors/create" element={<ConnectorCreatePage />} />
    <Route path="chargers/connectors/:id" element={<ConnectorDetailPage />} />
    <Route path="chargers/connectors/:id/edit" element={<ConnectorEditPage />} />
    
    {/* Remote Operations Routes */}
    <Route path="chargers/remote-operations" element={<RemoteOperationsDashboard />} />
    <Route path="chargers/remote-operations/reset" element={<ResetChargerPage />} />
    <Route path="chargers/remote-operations/get-config" element={<ChargerConfigsListPage />} />
    <Route path="chargers/remote-operations/set-config" element={<ChargerConfigDetailPage />} />
    <Route path="chargers/remote-operations/clear-cache" element={<ClearCachePage />} />
    <Route path="chargers/remote-operations/change-availability" element={<ChangeAvailabilityPage />} />
    <Route path="chargers/remote-operations/trigger-message" element={<TriggerMessagePage />} />
    <Route path="chargers/remote-operations/update-firmware" element={<UpdateFirmwarePage />} />
    <Route path="chargers/remote-operations/start" element={<RemoteStartPage />} />
    <Route path="chargers/remote-operations/stop" element={<RemoteStopPage />} />
    
    {/* These generic routes must be at the end to avoid overriding more specific routes */}
    <Route path="chargers/:id" element={<ChargerDetailPage />} />
    <Route path="chargers/:id/edit" element={<ChargerEditPage />} />
  </>
);
