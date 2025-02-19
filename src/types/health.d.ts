export interface ServiceStatus {
  api: boolean;
  database: boolean;
  storage: boolean;
}

export interface HealthCheckResponse {
  status: 'operational' | 'warning' | 'error';
  services: ServiceStatus;
  timestamp: string;
}
