import {App} from "../../ManagementConsole";
import {ConfigurationSectionCtrl} from "./ConfigurationSectionCtrl";

export class ConfigurationSection {

  bindings: any;
  controller: any;
  templateUrl: any;

  constructor() {
    this.bindings = {
      data: "=",
      meta: "=",
      fields: "=",
      initDefaults: "=",
      readOnly: "=",
      configCallbacks: "=",
    };
    this.controller = ConfigurationSectionCtrl;
    this.templateUrl = "components/configuration-section/view/configuration-section.html";
  }
}

const module: ng.IModule = App.module("managementConsole.components.configuration", []);
module.component("configurationSection", new ConfigurationSection());