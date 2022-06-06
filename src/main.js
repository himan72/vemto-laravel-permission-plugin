module.exports = (vemto) => {
    return {

        canInstall() {
            return true
        },

        onInstall() {
            vemto.savePluginData({
                authModel: this.getProjectAuthModel()
            })
        },
        composerPackages(packages) {

            packages.require['spatie/laravel-permission'] = '^5.0'

            return packages
        },

        beforeCodeGenerationStart() {
            if (!this.projectHasAuthModel()) {
                vemto.log.error('The plugin requires that the project has an auth Model')
                vemto.generator.abort()
            }

            if (this.projectAuthModelHasPermissionField()) {
                vemto.log.error('The Auth model has already a permission(s) field. See Spatie laravel-permission package documentation')
                vemto.generator.abort()
            }

            if (this.projectAuthModelHasRoleField()) {
                vemto.log.error('The Auth model has already a role(s) field. See Spatie laravel-permission package documentation')
                vemto.generator.abort()
            }
        },

        beforeCodeGenerationEnd() {
            vemto.log.info(`Configuring Laravel permission package`)
            this.projectPublishMigrationAndConfigFiles()
        },

        beforeRenderModel(template, content) {
            let data = template.getData(),
                model = data.model

            if (model.isAuthModel()) {
                return this.addHasRolesTraitToAuthModel(content, model)
            }

            return content
        },
        addHasRolesTraitToAuthModel(content, model) {
            let phpFile = vemto.parsePhp(content)

            vemto.log.message(`Adding HasRoles trait to ${model.name} model...`)

            phpFile.addUseStatement('Spatie\\Permission\\Traits\\HasRoles')

            phpFile.onClass(model.name).addTrait('HasRoles')

            return phpFile.getCode()
        },

        projectHasAuthModel() {
            let models = vemto.getProjectModels()
            let userModel = models.find(model => model.isAuthModel());

            return userModel !== undefined;
        },

        projectAuthModelHasRoleField() {
            let model = this.getProjectAuthModel()
            return model.getFieldByName('role') !== undefined || model.getFieldByName('roles') !== undefined
        },

        projectAuthModelHasPermissionField() {
            let model = this.getProjectAuthModel()
            return model.getFieldByName('permission') !== undefined || model.getFieldByName('permissions') !== undefined

        },

        projectPublishMigrationAndConfigFiles() {
            if (vemto.projectFileExists('/config/permission.php')) {
                vemto.log.warning('Laravel permission configuration already generated. Skipping...')
                return
            }
            vemto.executeArtisan(`vendor:publish --provider="Spatie\\Permission\\PermissionServiceProvider"`)
            vemto.registerProjectFile('/config/permission.php')
        },

        getProjectAuthModel() {
            let models = vemto.getProjectModels()
            let authModels = models.filter(model => model.isAuthModel());
            return authModels[0]
        },
    }
}
