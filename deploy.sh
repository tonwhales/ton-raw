set -e
yq w -i deployment.yaml 'spec.template.spec.containers[0].image' "tonwhales/ton-chain:v$BUILD_NUMBER"
yq w -i deployment-worker.yaml 'spec.template.spec.containers[0].image' "tonwhales/ton-chain:v$BUILD_NUMBER"
kubectl apply -f ./deployment.yaml
kubectl apply -f ./deployment-worker.yaml