export type AutopilotMode = "ACTIVE" | "SHADOW_TELEMETRY" | "DISABLED";

export interface AutopilotControlSettings {
  masterEnabled: boolean;
  orderDispatchMode: AutopilotMode; // Automation #1
  deliveryRescueMode: AutopilotMode; // Automation #2
  settlementReconciliationMode: AutopilotMode; // Automation #3
  inventoryReorderMode: AutopilotMode; // Automation #4
  commandCenterMode: AutopilotMode; // Automation #5
  telemetryGatheringEnabled: boolean;
  updatedAt: string;
}

export const DEFAULT_AUTOPILOT_SETTINGS: AutopilotControlSettings = {
  masterEnabled: true,
  orderDispatchMode: "ACTIVE",
  deliveryRescueMode: "ACTIVE",
  settlementReconciliationMode: "ACTIVE",
  inventoryReorderMode: "ACTIVE",
  commandCenterMode: "ACTIVE",
  telemetryGatheringEnabled: true,
  updatedAt: new Date().toISOString(),
};
