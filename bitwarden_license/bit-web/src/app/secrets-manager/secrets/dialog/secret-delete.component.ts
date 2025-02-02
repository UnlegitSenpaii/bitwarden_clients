import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject } from "@angular/core";

import { DialogServiceAbstraction } from "@bitwarden/angular/services/dialog";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";

import { SecretListView } from "../../models/view/secret-list.view";
import {
  BulkOperationStatus,
  BulkStatusDetails,
  BulkStatusDialogComponent,
} from "../../shared/dialogs/bulk-status-dialog.component";
import { SecretService } from "../secret.service";

export interface SecretDeleteOperation {
  secrets: SecretListView[];
}

@Component({
  templateUrl: "./secret-delete.component.html",
})
export class SecretDeleteDialogComponent {
  constructor(
    public dialogRef: DialogRef,
    private secretService: SecretService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    @Inject(DIALOG_DATA) private data: SecretDeleteOperation,
    private dialogService: DialogServiceAbstraction
  ) {}

  showSoftDeleteSecretWarning = this.data.secrets.length === 1;

  get title() {
    return this.data.secrets.length === 1 ? "deleteSecret" : "deleteSecrets";
  }

  get submitButtonText() {
    return this.data.secrets.length === 1 ? "deleteSecret" : "deleteSecrets";
  }

  delete = async () => {
    const bulkResponses = await this.secretService.delete(this.data.secrets);

    if (bulkResponses.find((response) => response.errorMessage)) {
      this.openBulkStatusDialog(bulkResponses.filter((response) => response.errorMessage));
      this.dialogRef.close(true);
      return;
    }

    const message =
      this.data.secrets.length === 1 ? "softDeleteSuccessToast" : "softDeletesSuccessToast";
    this.platformUtilsService.showToast("success", null, this.i18nService.t(message));

    this.dialogRef.close(true);
  };

  openBulkStatusDialog(bulkStatusResults: BulkOperationStatus[]) {
    this.dialogService.open<unknown, BulkStatusDetails>(BulkStatusDialogComponent, {
      data: {
        title: "deleteSecrets",
        subTitle: "secrets",
        columnTitle: "name",
        message: "bulkDeleteSecretsErrorMessage",
        details: bulkStatusResults,
      },
    });
  }
}
