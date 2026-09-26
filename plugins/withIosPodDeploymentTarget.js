const { withPodfile } = require("expo/config-plugins");

module.exports = function withIosPodDeploymentTarget(config) {
  return withPodfile(config, (config) => {
    const marker = "# Buen Entorno: minimum iOS for all pods";
    const anchor = "post_install do |installer|";
    const contents = config.modResults.contents;

    if (contents.includes(marker)) return config;
    if (!contents.includes(anchor)) {
      throw new Error("No se encontró post_install en el Podfile");
    }

    config.modResults.contents = contents.replace(
      anchor,
      `${anchor}
  ${marker}
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |build_config|
      current = build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
      if current.nil? || Gem::Version.new(current) < Gem::Version.new('16.4')
        build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '16.4'
      end
    end
  end`
    );

    return config;
  });
};
