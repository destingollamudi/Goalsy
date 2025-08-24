import { IUserService, IAuthService } from '../interfaces/IUserService';
import { FirebaseUserService, FirebaseAuthService } from '../services';  

class ServiceContainer {
  private static instance: ServiceContainer;
  private userService!: IUserService;
  private authService!: IAuthService;

  private constructor() {
    this.initializeFirebaseServices();
  }

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  private initializeFirebaseServices() {
    this.userService = new FirebaseUserService();
    this.authService = new FirebaseAuthService();
  }

  getUserService(): IUserService {
    return this.userService;
  }

  getAuthService(): IAuthService {
    return this.authService;
  }
}

export default ServiceContainer;