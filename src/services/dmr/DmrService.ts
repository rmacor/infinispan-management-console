import {App} from "../../ManagementConsole";
import {IDmrRequest} from "./IDmrRequest";
import {AuthenticationService} from "../authentication/AuthenticationService";
import {ICredentials} from "../authentication/ICredentials";
import {UtilsService} from "../utils/UtilsService";

const module: ng.IModule = App.module("managementConsole.services.dmr", []);

export class DmrService {

  static $inject: string[] = ["$http", "$q", "authService", "$location", "utils"];

  url: string;

  constructor(private $http: ng.IHttpService,
              private $q: ng.IQService,
              private authService: AuthenticationService,
              private $location: ng.ILocationService,
              private utils: UtilsService) {
  }

  readResource(request: IDmrRequest): angular.IPromise<any> {
    request.operation = "resource";
    return this.executeGet(request);
  }

  readAttribute(request: IDmrRequest): angular.IPromise<any> {
    request.operation = "attribute";
    return this.executeGet(request);
  }

  readAttributeAndResolveExpression(request: IDmrRequest): angular.IPromise<any> {
    request.operation = "read-attribute";
    request["resolve-expressions"] = true;
    return this.executePost(request);
  }

  writeAttribute(request: IDmrRequest): angular.IPromise<any> {
    request.operation = "write-attribute";
    return this.executePost(request);
  }

  readChildResources(request: IDmrRequest): angular.IPromise<any> {
    request.operation = "read-children-resources";
    return this.executePost(request);
  }

  readChildName(request: IDmrRequest): ng.IPromise<any> {
    request.operation = "read-children-names";
    return this.executePost(request);
  }

  readEventLog(request: IDmrRequest): ng.IPromise<any> {
    request.operation = "read-event-log";
    return this.executePost(request);
  }

  private executeGet(request: IDmrRequest): ng.IPromise<any> {
    let config: ng.IRequestShortcutConfig = {
      timeout: 2000,
      withCredentials: true,
      headers: {
        "Accept": "application/json",
        "Content-type": "application/json"
      },
      cache: true
    };

    let deferred: ng.IDeferred<any> = this.$q.defer<any>();
    this.url = this.url === undefined ? this.generateBaseUrl(this.authService.getCredentials()) : this.url;
    let getUrl: string = this.generateGetUrl(this.url, request);

    this.$http.get(getUrl, config).then((success: any) => {
      deferred.resolve(success.data);
    }, (failure) => {
      let msg: string = this.processDmrFailure(failure);
      console.log(msg);
      deferred.reject();
    });
    return deferred.promise;
  }

  private executePost(request: IDmrRequest): ng.IPromise<any> {
    let config: ng.IRequestShortcutConfig = {
      timeout: 2000,
      withCredentials: true,
      headers: {
        "Accept": "application/json",
        "Content-type": "application/json"
      }
    };

    let deferred: ng.IDeferred<any> = this.$q.defer<any>();

    this.url = this.url === undefined ? this.generateBaseUrl(this.authService.getCredentials()) : this.url;
    this.$http.post(this.url, JSON.stringify(request), config)
      .then(
        (success: any) => deferred.resolve(success.data.result),
        (failure: any) => {
          let msg: string = this.processDmrFailure(failure);
          console.log(msg);
          deferred.reject(msg);
        });
    return deferred.promise;
  }

  private generateBaseUrl(c: ICredentials): string {
    let l: ng.ILocationService = this.$location;
    return `${l.protocol()}://${c.username}:${c.password}@${l.host()}:${l.port()}/management`;
  }

  private generateGetUrl(baseUrl: string, request: IDmrRequest): string {
    let path: string = request.address.join("/");
    let operation: string = "?operation=" + request.operation;
    for (let field of ["name", "proxies", "recursive", "recursive-depth", "include-runtime"]) {
      if (request[field] !== undefined) {
        operation += "&" + field + "=" + request[field];
      }
    }
    return baseUrl + "/" + path + operation;
  }

  private processDmrFailure(response: any): string {
    let status: number = response.status;
    let msg: string = "An unspecified error has been received from the server";
    if (status === 401) {
      msg = "Invalid login or password. Please try again";
    } else {
      console.log(response.data);
      let result: any = response.data
      if (result && result["failure-description"] != null) {
        msg = result["failure-description"];
      }
    }
    return msg;
  }
}

module.service("dmrService", DmrService);
