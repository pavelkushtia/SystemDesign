import { MLModelConfig } from '@scalesim/shared';

export interface MLLayer {
  id: string;
  type: 'linear' | 'conv2d' | 'lstm' | 'gru' | 'transformer' | 'embedding' | 'dropout' | 'batchnorm' | 'relu' | 'sigmoid' | 'softmax';
  config: Record<string, any>;
  inputShape?: number[];
  outputShape?: number[];
}

export interface TrainingConfig {
  optimizer: 'adam' | 'sgd' | 'rmsprop' | 'adamw';
  learningRate: number;
  batchSize: number;
  epochs: number;
  lossFunction: string;
  metrics: string[];
  validationSplit?: number;
  earlyStopping?: {
    patience: number;
    monitor: string;
  };
}

export interface DataConfig {
  inputFormat: 'csv' | 'json' | 'parquet' | 'images' | 'text';
  features: string[];
  target: string;
  preprocessing?: {
    normalization?: 'standard' | 'minmax' | 'robust';
    encoding?: 'onehot' | 'label' | 'target';
    textProcessing?: 'tokenize' | 'tfidf' | 'word2vec';
  };
}

export interface ServingConfig {
  apiFramework: 'fastapi' | 'flask' | 'torchserve' | 'tensorflow-serving';
  containerized: boolean;
  scalingConfig?: {
    minReplicas: number;
    maxReplicas: number;
    targetCPU: number;
  };
}

export interface ExtendedMLModelConfig extends MLModelConfig {
  layers: MLLayer[];
  training: TrainingConfig;
  data: DataConfig;
  serving?: ServingConfig;
  monitoring?: {
    metrics: string[];
    alerting: boolean;
  };
}

export class MLModelBuilder {
  generateCode(config: ExtendedMLModelConfig): Record<string, string> {
    const files: Record<string, string> = {};
    
    switch (config.framework) {
      case 'pytorch':
        return this.generatePyTorchModel(config);
      case 'tensorflow':
        return this.generateTensorFlowModel(config);
      case 'scikit-learn':
        return this.generateScikitLearnModel(config);
      case 'xgboost':
        return this.generateXGBoostModel(config);
      default:
        return this.generatePyTorchModel(config);
    }
  }

  private generatePyTorchModel(config: ExtendedMLModelConfig): Record<string, string> {
    const files: Record<string, string> = {};

    // Requirements
    files['requirements.txt'] = this.generatePyTorchRequirements(config);

    // Model definition
    files['model.py'] = this.generatePyTorchModelClass(config);

    // Training script
    files['train.py'] = this.generatePyTorchTrainingScript(config);

    // Data preprocessing
    files['data_preprocessing.py'] = this.generateDataPreprocessing(config);

    // Inference script
    files['inference.py'] = this.generatePyTorchInference(config);

    // Serving API
    if (config.serving) {
      files['serve.py'] = this.generateServingAPI(config);
    }

    // Configuration files
    files['config.yaml'] = this.generateConfigFile(config);

    // Docker files
    files['Dockerfile'] = this.generateMLDockerfile(config);
    files['docker-compose.yml'] = this.generateMLDockerCompose(config);

    // Monitoring
    if (config.monitoring) {
      files['monitoring.py'] = this.generateMonitoringCode(config);
    }

    // Tests
    files['test_model.py'] = this.generateModelTests(config);

    // MLOps files
    files['mlflow_tracking.py'] = this.generateMLflowTracking(config);
    files['model_registry.py'] = this.generateModelRegistry(config);

    // Deployment manifests
    files['k8s/deployment.yaml'] = this.generateKubernetesDeployment(config);
    files['k8s/service.yaml'] = this.generateKubernetesService(config);

    // README
    files['README.md'] = this.generateMLReadme(config);

    return files;
  }

  private generatePyTorchModelClass(config: ExtendedMLModelConfig): string {
    const layerDefinitions = config.layers.map(layer => this.generatePyTorchLayer(layer)).join('\n        ');
    const forwardPass = this.generatePyTorchForward(config.layers);

    return `import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, Any, Optional

class ${config.name.replace(/\s+/g, '')}Model(nn.Module):
    """
    Generated PyTorch model for ${config.name}
    Task: ${config.taskType}
    Architecture: ${config.layers.length} layers
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        super(${config.name.replace(/\s+/g, '')}Model, self).__init__()
        
        # Model configuration
        self.config = config or {}
        self.task_type = "${config.taskType}"
        
        # Model layers
        ${layerDefinitions}
        
        # Initialize weights
        self._initialize_weights()
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass through the model"""
        ${forwardPass}
        return x
    
    def _initialize_weights(self):
        """Initialize model weights"""
        for module in self.modules():
            if isinstance(module, nn.Linear):
                nn.init.xavier_uniform_(module.weight)
                if module.bias is not None:
                    nn.init.zeros_(module.bias)
            elif isinstance(module, nn.Conv2d):
                nn.init.kaiming_normal_(module.weight, mode='fan_out', nonlinearity='relu')
                if module.bias is not None:
                    nn.init.zeros_(module.bias)
            elif isinstance(module, nn.BatchNorm2d):
                nn.init.ones_(module.weight)
                nn.init.zeros_(module.bias)
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information"""
        total_params = sum(p.numel() for p in self.parameters())
        trainable_params = sum(p.numel() for p in self.parameters() if p.requires_grad)
        
        return {
            'model_name': '${config.name}',
            'task_type': self.task_type,
            'total_parameters': total_params,
            'trainable_parameters': trainable_params,
            'layers': ${config.layers.length},
            'framework': 'pytorch'
        }

# Model factory function
def create_model(config: Optional[Dict[str, Any]] = None) -> ${config.name.replace(/\s+/g, '')}Model:
    """Create and return model instance"""
    return ${config.name.replace(/\s+/g, '')}Model(config)

# Export model architecture
def get_model_architecture() -> Dict[str, Any]:
    """Get model architecture definition"""
    return {
        'layers': ${JSON.stringify(config.layers, null, 8)},
        'task_type': '${config.taskType}',
        'framework': '${config.framework}'
    }`;
  }

  private generatePyTorchTrainingScript(config: ExtendedMLModelConfig): string {
    return `import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import mlflow
import mlflow.pytorch
from typing import Dict, Any, Tuple
import logging
import os
from datetime import datetime

from model import create_model
from data_preprocessing import DataPreprocessor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ${config.name.replace(/\s+/g, '')}Dataset(Dataset):
    """Custom dataset for ${config.name}"""
    
    def __init__(self, features: np.ndarray, targets: np.ndarray):
        self.features = torch.FloatTensor(features)
        self.targets = torch.FloatTensor(targets) if config.taskType == 'regression' else torch.LongTensor(targets)
    
    def __len__(self):
        return len(self.features)
    
    def __getitem__(self, idx):
        return self.features[idx], self.targets[idx]

class ModelTrainer:
    """Training pipeline for ${config.name}"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logger.info(f"Using device: {self.device}")
        
        # Initialize model
        self.model = create_model(config).to(self.device)
        
        # Initialize optimizer
        self.optimizer = self._get_optimizer()
        
        # Initialize loss function
        self.criterion = self._get_loss_function()
        
        # Initialize metrics
        self.metrics = {}
        
    def _get_optimizer(self) -> optim.Optimizer:
        """Get optimizer based on configuration"""
        optimizer_name = "${config.training.optimizer}"
        lr = ${config.training.learningRate}
        
        if optimizer_name == 'adam':
            return optim.Adam(self.model.parameters(), lr=lr)
        elif optimizer_name == 'sgd':
            return optim.SGD(self.model.parameters(), lr=lr, momentum=0.9)
        elif optimizer_name == 'rmsprop':
            return optim.RMSprop(self.model.parameters(), lr=lr)
        elif optimizer_name == 'adamw':
            return optim.AdamW(self.model.parameters(), lr=lr)
        else:
            return optim.Adam(self.model.parameters(), lr=lr)
    
    def _get_loss_function(self) -> nn.Module:
        """Get loss function based on task type"""
        if "${config.taskType}" == "classification":
            return nn.CrossEntropyLoss()
        elif "${config.taskType}" == "regression":
            return nn.MSELoss()
        elif "${config.taskType}" == "binary_classification":
            return nn.BCEWithLogitsLoss()
        else:
            return nn.MSELoss()
    
    def train_epoch(self, train_loader: DataLoader) -> Dict[str, float]:
        """Train for one epoch"""
        self.model.train()
        total_loss = 0.0
        num_batches = 0
        
        for batch_idx, (data, target) in enumerate(train_loader):
            data, target = data.to(self.device), target.to(self.device)
            
            # Zero gradients
            self.optimizer.zero_grad()
            
            # Forward pass
            output = self.model(data)
            loss = self.criterion(output, target)
            
            # Backward pass
            loss.backward()
            self.optimizer.step()
            
            total_loss += loss.item()
            num_batches += 1
            
            if batch_idx % 100 == 0:
                logger.info(f'Batch {batch_idx}/{len(train_loader)}, Loss: {loss.item():.6f}')
        
        avg_loss = total_loss / num_batches
        return {'train_loss': avg_loss}
    
    def validate_epoch(self, val_loader: DataLoader) -> Dict[str, float]:
        """Validate for one epoch"""
        self.model.eval()
        total_loss = 0.0
        all_predictions = []
        all_targets = []
        
        with torch.no_grad():
            for data, target in val_loader:
                data, target = data.to(self.device), target.to(self.device)
                
                output = self.model(data)
                loss = self.criterion(output, target)
                
                total_loss += loss.item()
                
                # Collect predictions and targets for metrics
                if "${config.taskType}" == "classification":
                    predictions = torch.argmax(output, dim=1)
                else:
                    predictions = output
                
                all_predictions.extend(predictions.cpu().numpy())
                all_targets.extend(target.cpu().numpy())
        
        avg_loss = total_loss / len(val_loader)
        
        # Calculate metrics
        metrics = {'val_loss': avg_loss}
        
        if "${config.taskType}" == "classification":
            metrics['val_accuracy'] = accuracy_score(all_targets, all_predictions)
            metrics['val_precision'] = precision_score(all_targets, all_predictions, average='weighted')
            metrics['val_recall'] = recall_score(all_targets, all_predictions, average='weighted')
            metrics['val_f1'] = f1_score(all_targets, all_predictions, average='weighted')
        
        return metrics
    
    def train(self, train_loader: DataLoader, val_loader: DataLoader) -> Dict[str, Any]:
        """Full training loop"""
        logger.info("Starting training...")
        
        # MLflow tracking
        with mlflow.start_run():
            # Log parameters
            mlflow.log_params({
                'model_name': '${config.name}',
                'framework': '${config.framework}',
                'task_type': '${config.taskType}',
                'optimizer': '${config.training.optimizer}',
                'learning_rate': ${config.training.learningRate},
                'batch_size': ${config.training.batchSize},
                'epochs': ${config.training.epochs}
            })
            
            best_val_loss = float('inf')
            patience_counter = 0
            training_history = []
            
            for epoch in range(${config.training.epochs}):
                logger.info(f"Epoch {epoch + 1}/${config.training.epochs}")
                
                # Training
                train_metrics = self.train_epoch(train_loader)
                
                # Validation
                val_metrics = self.validate_epoch(val_loader)
                
                # Combine metrics
                epoch_metrics = {**train_metrics, **val_metrics}
                training_history.append(epoch_metrics)
                
                # Log metrics to MLflow
                mlflow.log_metrics(epoch_metrics, step=epoch)
                
                # Early stopping
                ${config.training.earlyStopping ? `
                if val_metrics['val_loss'] < best_val_loss:
                    best_val_loss = val_metrics['val_loss']
                    patience_counter = 0
                    # Save best model
                    torch.save(self.model.state_dict(), 'best_model.pth')
                else:
                    patience_counter += 1
                    if patience_counter >= ${config.training.earlyStopping?.patience || 10}:
                        logger.info(f"Early stopping at epoch {epoch + 1}")
                        break
                ` : ''}
                
                logger.info(f"Epoch {epoch + 1} - " + 
                          " - ".join([f"{k}: {v:.4f}" for k, v in epoch_metrics.items()]))
            
            # Save final model
            torch.save(self.model.state_dict(), 'final_model.pth')
            
            # Log model to MLflow
            mlflow.pytorch.log_model(self.model, "model")
            
            return {
                'training_history': training_history,
                'best_val_loss': best_val_loss,
                'model_info': self.model.get_model_info()
            }

def main():
    """Main training function"""
    # Load and preprocess data
    preprocessor = DataPreprocessor()
    X, y = preprocessor.load_and_preprocess_data('data.csv')
    
    # Split data
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=${config.training.validationSplit || 0.2}, random_state=42
    )
    
    # Create datasets and loaders
    train_dataset = ${config.name.replace(/\s+/g, '')}Dataset(X_train, y_train)
    val_dataset = ${config.name.replace(/\s+/g, '')}Dataset(X_val, y_val)
    
    train_loader = DataLoader(
        train_dataset, 
        batch_size=${config.training.batchSize}, 
        shuffle=True
    )
    val_loader = DataLoader(
        val_dataset, 
        batch_size=${config.training.batchSize}, 
        shuffle=False
    )
    
    # Initialize trainer
    trainer = ModelTrainer({})
    
    # Train model
    results = trainer.train(train_loader, val_loader)
    
    logger.info("Training completed!")
    logger.info(f"Best validation loss: {results['best_val_loss']:.4f}")

if __name__ == "__main__":
    main()`;
  }

  private generateDataPreprocessing(config: ExtendedMLModelConfig): string {
    return `import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib
from typing import Tuple, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class DataPreprocessor:
    """Data preprocessing pipeline for ${config.name}"""
    
    def __init__(self):
        self.scalers = {}
        self.encoders = {}
        self.vectorizers = {}
        self.feature_names = []
        
    def load_data(self, file_path: str) -> pd.DataFrame:
        """Load data from file"""
        if file_path.endswith('.csv'):
            return pd.read_csv(file_path)
        elif file_path.endswith('.json'):
            return pd.read_json(file_path)
        elif file_path.endswith('.parquet'):
            return pd.read_parquet(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_path}")
    
    def preprocess_features(self, df: pd.DataFrame, fit: bool = True) -> np.ndarray:
        """Preprocess features"""
        features = df[${JSON.stringify(config.data.features)}].copy()
        
        # Handle missing values
        features = features.fillna(features.mean() if features.select_dtypes(include=[np.number]).shape[1] > 0 else features.mode().iloc[0])
        
        processed_features = []
        
        for column in features.columns:
            if features[column].dtype in ['object', 'category']:
                # Categorical encoding
                ${config.data.preprocessing?.encoding === 'onehot' ? `
                if fit:
                    encoder = OneHotEncoder(sparse=False, handle_unknown='ignore')
                    encoded = encoder.fit_transform(features[[column]])
                    self.encoders[column] = encoder
                else:
                    encoded = self.encoders[column].transform(features[[column]])
                processed_features.append(encoded)
                ` : `
                if fit:
                    encoder = LabelEncoder()
                    encoded = encoder.fit_transform(features[column])
                    self.encoders[column] = encoder
                else:
                    encoded = self.encoders[column].transform(features[column])
                processed_features.append(encoded.reshape(-1, 1))
                `}
            else:
                # Numerical scaling
                ${config.data.preprocessing?.normalization === 'standard' ? `
                if fit:
                    scaler = StandardScaler()
                    scaled = scaler.fit_transform(features[[column]])
                    self.scalers[column] = scaler
                else:
                    scaled = self.scalers[column].transform(features[[column]])
                ` : config.data.preprocessing?.normalization === 'minmax' ? `
                if fit:
                    scaler = MinMaxScaler()
                    scaled = scaler.fit_transform(features[[column]])
                    self.scalers[column] = scaler
                else:
                    scaled = self.scalers[column].transform(features[[column]])
                ` : `
                scaled = features[[column]].values
                `}
                processed_features.append(scaled)
        
        return np.concatenate(processed_features, axis=1)
    
    def preprocess_target(self, df: pd.DataFrame, fit: bool = True) -> np.ndarray:
        """Preprocess target variable"""
        target = df['${config.data.target}']
        
        if "${config.taskType}" == "classification":
            if fit:
                encoder = LabelEncoder()
                encoded_target = encoder.fit_transform(target)
                self.encoders['target'] = encoder
            else:
                encoded_target = self.encoders['target'].transform(target)
            return encoded_target
        else:
            return target.values
    
    def load_and_preprocess_data(self, file_path: str) -> Tuple[np.ndarray, np.ndarray]:
        """Load and preprocess data"""
        logger.info(f"Loading data from {file_path}")
        df = self.load_data(file_path)
        
        logger.info("Preprocessing features...")
        X = self.preprocess_features(df, fit=True)
        
        logger.info("Preprocessing target...")
        y = self.preprocess_target(df, fit=True)
        
        logger.info(f"Data shape: X={X.shape}, y={y.shape}")
        
        return X, y
    
    def save_preprocessors(self, path: str = 'preprocessors.joblib'):
        """Save preprocessing objects"""
        joblib.dump({
            'scalers': self.scalers,
            'encoders': self.encoders,
            'vectorizers': self.vectorizers,
            'feature_names': self.feature_names
        }, path)
        logger.info(f"Preprocessors saved to {path}")
    
    def load_preprocessors(self, path: str = 'preprocessors.joblib'):
        """Load preprocessing objects"""
        data = joblib.load(path)
        self.scalers = data['scalers']
        self.encoders = data['encoders']
        self.vectorizers = data['vectorizers']
        self.feature_names = data['feature_names']
        logger.info(f"Preprocessors loaded from {path}")`;
  }

  private generateServingAPI(config: ExtendedMLModelConfig): string {
    if (config.serving?.apiFramework === 'fastapi') {
      return `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
import numpy as np
from typing import List, Dict, Any
import joblib
import logging

from model import create_model
from data_preprocessing import DataPreprocessor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="${config.name} ML API",
    description="Generated ML serving API for ${config.name}",
    version="1.0.0"
)

# Global variables for model and preprocessor
model = None
preprocessor = None
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

class PredictionRequest(BaseModel):
    features: Dict[str, Any]

class PredictionResponse(BaseModel):
    prediction: Any
    confidence: float
    model_version: str

@app.on_event("startup")
async def load_model():
    """Load model and preprocessor on startup"""
    global model, preprocessor
    
    try:
        # Load model
        model = create_model()
        model.load_state_dict(torch.load('best_model.pth', map_location=device))
        model.eval()
        model.to(device)
        
        # Load preprocessor
        preprocessor = DataPreprocessor()
        preprocessor.load_preprocessors('preprocessors.joblib')
        
        logger.info("Model and preprocessor loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise e

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "device": str(device)
    }

@app.get("/model/info")
async def model_info():
    """Get model information"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    return model.get_model_info()

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """Make prediction"""
    if model is None or preprocessor is None:
        raise HTTPException(status_code=503, detail="Model or preprocessor not loaded")
    
    try:
        # Convert request to DataFrame
        import pandas as pd
        df = pd.DataFrame([request.features])
        
        # Preprocess features
        X = preprocessor.preprocess_features(df, fit=False)
        
        # Convert to tensor
        X_tensor = torch.FloatTensor(X).to(device)
        
        # Make prediction
        with torch.no_grad():
            output = model(X_tensor)
            
            if "${config.taskType}" == "classification":
                probabilities = torch.softmax(output, dim=1)
                prediction = torch.argmax(probabilities, dim=1).item()
                confidence = torch.max(probabilities).item()
            else:
                prediction = output.item()
                confidence = 1.0  # For regression, confidence is not well-defined
        
        return PredictionResponse(
            prediction=prediction,
            confidence=confidence,
            model_version="1.0.0"
        )
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/batch_predict")
async def batch_predict(requests: List[PredictionRequest]):
    """Make batch predictions"""
    if model is None or preprocessor is None:
        raise HTTPException(status_code=503, detail="Model or preprocessor not loaded")
    
    try:
        predictions = []
        for request in requests:
            # Process each request individually
            result = await predict(request)
            predictions.append(result)
        
        return {"predictions": predictions}
        
    except Exception as e:
        logger.error(f"Batch prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)`;
    }
    
    return '# Serving API placeholder';
  }

  // Helper methods for generating PyTorch layers and forward pass
  private generatePyTorchLayer(layer: MLLayer): string {
    switch (layer.type) {
      case 'linear':
        return `self.${layer.id} = nn.Linear(${layer.config.in_features}, ${layer.config.out_features})`;
      case 'conv2d':
        return `self.${layer.id} = nn.Conv2d(${layer.config.in_channels}, ${layer.config.out_channels}, ${layer.config.kernel_size})`;
      case 'lstm':
        return `self.${layer.id} = nn.LSTM(${layer.config.input_size}, ${layer.config.hidden_size}, batch_first=True)`;
      case 'dropout':
        return `self.${layer.id} = nn.Dropout(${layer.config.p || 0.5})`;
      case 'batchnorm':
        return `self.${layer.id} = nn.BatchNorm1d(${layer.config.num_features})`;
      case 'embedding':
        return `self.${layer.id} = nn.Embedding(${layer.config.num_embeddings}, ${layer.config.embedding_dim})`;
      default:
        return `# ${layer.type} layer - implement as needed`;
    }
  }

  private generatePyTorchForward(layers: MLLayer[]): string {
    const forwardSteps = layers.map(layer => {
      switch (layer.type) {
        case 'relu':
          return `x = F.relu(x)`;
        case 'sigmoid':
          return `x = torch.sigmoid(x)`;
        case 'softmax':
          return `x = F.softmax(x, dim=1)`;
        case 'dropout':
        case 'batchnorm':
        case 'linear':
        case 'conv2d':
        case 'lstm':
        case 'embedding':
          return `x = self.${layer.id}(x)`;
        default:
          return `# Apply ${layer.type} transformation`;
      }
    });

    return forwardSteps.join('\n        ');
  }

  private generatePyTorchRequirements(config: ExtendedMLModelConfig): string {
    const requirements = [
      'torch>=2.0.0',
      'torchvision>=0.15.0',
      'numpy>=1.21.0',
      'pandas>=1.3.0',
      'scikit-learn>=1.0.0',
      'mlflow>=2.0.0',
      'joblib>=1.1.0'
    ];

    if (config.serving?.apiFramework === 'fastapi') {
      requirements.push('fastapi>=0.100.0', 'uvicorn[standard]>=0.20.0', 'pydantic>=2.0.0');
    }

    if (config.monitoring) {
      requirements.push('prometheus-client>=0.15.0', 'psutil>=5.8.0');
    }

    return requirements.join('\n');
  }

  // Additional helper methods for other frameworks and components...
  private generateTensorFlowModel(config: ExtendedMLModelConfig): Record<string, string> {
    // TensorFlow implementation
    return {
      'model.py': '# TensorFlow model implementation',
      'requirements.txt': 'tensorflow>=2.10.0\nnumpy>=1.21.0'
    };
  }

  private generateScikitLearnModel(config: ExtendedMLModelConfig): Record<string, string> {
    // Scikit-learn implementation
    return {
      'model.py': '# Scikit-learn model implementation',
      'requirements.txt': 'scikit-learn>=1.0.0\nnumpy>=1.21.0'
    };
  }

  private generateXGBoostModel(config: ExtendedMLModelConfig): Record<string, string> {
    // XGBoost implementation
    return {
      'model.py': '# XGBoost model implementation',
      'requirements.txt': 'xgboost>=1.6.0\nnumpy>=1.21.0'
    };
  }

  private generateConfigFile(config: ExtendedMLModelConfig): string {
    return `# Configuration file for ${config.name}
model:
  name: "${config.name}"
  framework: "${config.framework}"
  task_type: "${config.taskType}"
  
training:
  optimizer: "${config.training.optimizer}"
  learning_rate: ${config.training.learningRate}
  batch_size: ${config.training.batchSize}
  epochs: ${config.training.epochs}
  loss_function: "${config.training.lossFunction}"
  
data:
  input_format: "${config.data.inputFormat}"
  features: ${JSON.stringify(config.data.features)}
  target: "${config.data.target}"
  
serving:
  api_framework: "${config.serving?.apiFramework || 'fastapi'}"
  containerized: ${config.serving?.containerized || true}
`;
  }

  private generateMLDockerfile(config: ExtendedMLModelConfig): string {
    return `FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    g++ \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["python", "serve.py"]`;
  }

  private generateMLDockerCompose(config: ExtendedMLModelConfig): string {
    return `version: '3.8'

services:
  ml-api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - MODEL_PATH=/app/best_model.pth
      - PREPROCESSOR_PATH=/app/preprocessors.joblib
    volumes:
      - ./models:/app/models
      - ./data:/app/data
    restart: unless-stopped
    
  ${config.monitoring ? `
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
  
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana
  ` : ''}

${config.monitoring ? `
volumes:
  grafana-storage:
` : ''}`;
  }

  private generateMonitoringCode(config: ExtendedMLModelConfig): string {
    return `import time
import psutil
import torch
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import logging

logger = logging.getLogger(__name__)

# Prometheus metrics
PREDICTION_COUNTER = Counter('ml_predictions_total', 'Total number of predictions')
PREDICTION_LATENCY = Histogram('ml_prediction_duration_seconds', 'Prediction latency')
MODEL_ACCURACY = Gauge('ml_model_accuracy', 'Current model accuracy')
SYSTEM_CPU = Gauge('system_cpu_percent', 'System CPU usage')
SYSTEM_MEMORY = Gauge('system_memory_percent', 'System memory usage')
GPU_MEMORY = Gauge('gpu_memory_percent', 'GPU memory usage')

class ModelMonitor:
    """Monitor ML model performance and system metrics"""
    
    def __init__(self, model, port: int = 8001):
        self.model = model
        self.port = port
        self.start_time = time.time()
        
    def start_monitoring(self):
        """Start Prometheus metrics server"""
        start_http_server(self.port)
        logger.info(f"Monitoring server started on port {self.port}")
        
    def record_prediction(self, latency: float):
        """Record a prediction event"""
        PREDICTION_COUNTER.inc()
        PREDICTION_LATENCY.observe(latency)
        
    def update_system_metrics(self):
        """Update system metrics"""
        # CPU and memory
        SYSTEM_CPU.set(psutil.cpu_percent())
        SYSTEM_MEMORY.set(psutil.virtual_memory().percent)
        
        # GPU metrics (if available)
        if torch.cuda.is_available():
            gpu_memory = torch.cuda.memory_allocated() / torch.cuda.max_memory_allocated() * 100
            GPU_MEMORY.set(gpu_memory)
    
    def update_model_metrics(self, accuracy: float):
        """Update model-specific metrics"""
        MODEL_ACCURACY.set(accuracy)
        
    def get_uptime(self) -> float:
        """Get service uptime in seconds"""
        return time.time() - self.start_time`;
  }

  private generateModelTests(config: ExtendedMLModelConfig): string {
    return `import unittest
import torch
import numpy as np
from model import create_model
from data_preprocessing import DataPreprocessor

class Test${config.name.replace(/\s+/g, '')}Model(unittest.TestCase):
    """Test cases for ${config.name} model"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.model = create_model()
        self.device = torch.device('cpu')  # Use CPU for testing
        
    def test_model_creation(self):
        """Test model can be created"""
        self.assertIsNotNone(self.model)
        self.assertEqual(self.model.task_type, "${config.taskType}")
        
    def test_model_forward_pass(self):
        """Test model forward pass"""
        # Create dummy input
        batch_size = 4
        input_size = ${config.layers[0]?.config?.in_features || 10}
        dummy_input = torch.randn(batch_size, input_size)
        
        # Forward pass
        with torch.no_grad():
            output = self.model(dummy_input)
            
        # Check output shape
        self.assertEqual(output.shape[0], batch_size)
        self.assertFalse(torch.isnan(output).any())
        
    def test_model_info(self):
        """Test model info method"""
        info = self.model.get_model_info()
        
        self.assertIn('model_name', info)
        self.assertIn('total_parameters', info)
        self.assertIn('trainable_parameters', info)
        self.assertEqual(info['framework'], 'pytorch')
        
    def test_model_parameters(self):
        """Test model has trainable parameters"""
        total_params = sum(p.numel() for p in self.model.parameters())
        trainable_params = sum(p.numel() for p in self.model.parameters() if p.requires_grad)
        
        self.assertGreater(total_params, 0)
        self.assertGreater(trainable_params, 0)
        
class TestDataPreprocessor(unittest.TestCase):
    """Test cases for data preprocessor"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.preprocessor = DataPreprocessor()
        
    def test_preprocessor_creation(self):
        """Test preprocessor can be created"""
        self.assertIsNotNone(self.preprocessor)
        
    # Add more preprocessing tests as needed

if __name__ == '__main__':
    unittest.main()`;
  }

  private generateMLflowTracking(config: ExtendedMLModelConfig): string {
    return `import mlflow
import mlflow.pytorch
from typing import Dict, Any

class MLflowTracker:
    """MLflow experiment tracking for ${config.name}"""
    
    def __init__(self, experiment_name: str = "${config.name}"):
        self.experiment_name = experiment_name
        mlflow.set_experiment(experiment_name)
        
    def start_run(self, run_name: str = None):
        """Start MLflow run"""
        return mlflow.start_run(run_name=run_name)
        
    def log_params(self, params: Dict[str, Any]):
        """Log parameters"""
        mlflow.log_params(params)
        
    def log_metrics(self, metrics: Dict[str, float], step: int = None):
        """Log metrics"""
        mlflow.log_metrics(metrics, step=step)
        
    def log_model(self, model, artifact_path: str = "model"):
        """Log PyTorch model"""
        mlflow.pytorch.log_model(model, artifact_path)
        
    def log_artifacts(self, local_dir: str):
        """Log artifacts"""
        mlflow.log_artifacts(local_dir)`;
  }

  private generateModelRegistry(config: ExtendedMLModelConfig): string {
    return `import mlflow
from mlflow.tracking import MlflowClient

class ModelRegistry:
    """Model registry for ${config.name}"""
    
    def __init__(self):
        self.client = MlflowClient()
        self.model_name = "${config.name.replace(/\s+/g, '_')}"
        
    def register_model(self, model_uri: str, version_description: str = None):
        """Register model version"""
        result = mlflow.register_model(
            model_uri=model_uri,
            name=self.model_name
        )
        
        if version_description:
            self.client.update_model_version(
                name=self.model_name,
                version=result.version,
                description=version_description
            )
            
        return result
        
    def transition_model_stage(self, version: str, stage: str):
        """Transition model to different stage"""
        self.client.transition_model_version_stage(
            name=self.model_name,
            version=version,
            stage=stage
        )
        
    def get_latest_model_version(self, stage: str = "Production"):
        """Get latest model version in stage"""
        latest_version = self.client.get_latest_versions(
            self.model_name, 
            stages=[stage]
        )
        return latest_version[0] if latest_version else None`;
  }

  private generateKubernetesDeployment(config: ExtendedMLModelConfig): string {
    return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${config.name.toLowerCase().replace(/\s+/g, '-')}-ml-api
  labels:
    app: ${config.name.toLowerCase().replace(/\s+/g, '-')}-ml-api
spec:
  replicas: ${config.serving?.scalingConfig?.minReplicas || 2}
  selector:
    matchLabels:
      app: ${config.name.toLowerCase().replace(/\s+/g, '-')}-ml-api
  template:
    metadata:
      labels:
        app: ${config.name.toLowerCase().replace(/\s+/g, '-')}-ml-api
    spec:
      containers:
      - name: ml-api
        image: ${config.name.toLowerCase().replace(/\s+/g, '-')}-ml-api:latest
        ports:
        - containerPort: 8000
        env:
        - name: MODEL_PATH
          value: "/app/best_model.pth"
        - name: PREPROCESSOR_PATH
          value: "/app/preprocessors.joblib"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5`;
  }

  private generateKubernetesService(config: ExtendedMLModelConfig): string {
    return `apiVersion: v1
kind: Service
metadata:
  name: ${config.name.toLowerCase().replace(/\s+/g, '-')}-ml-api-service
spec:
  selector:
    app: ${config.name.toLowerCase().replace(/\s+/g, '-')}-ml-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8000
  type: LoadBalancer`;
  }

  private generateMLReadme(config: ExtendedMLModelConfig): string {
    return `# ${config.name}

Generated ML model using ScaleSim ML Builder.

## Model Information

- **Framework**: ${config.framework}
- **Task Type**: ${config.taskType}
- **Layers**: ${config.layers.length}
- **Training Algorithm**: ${config.training.optimizer}

## Architecture

${config.layers.map((layer, index) => 
  `${index + 1}. **${layer.type}** - ${JSON.stringify(layer.config)}`
).join('\n')}

## Quick Start

### Training

1. Prepare your data in CSV format with features: ${config.data.features.join(', ')}
2. Run training:
   \`\`\`bash
   python train.py
   \`\`\`

### Serving

1. Start the API server:
   \`\`\`bash
   python serve.py
   \`\`\`

2. Make predictions:
   \`\`\`bash
   curl -X POST "http://localhost:8000/predict" \\
        -H "Content-Type: application/json" \\
        -d '{"features": {"feature1": 1.0, "feature2": 2.0}}'
   \`\`\`

### Docker Deployment

\`\`\`bash
docker-compose up -d
\`\`\`

### Kubernetes Deployment

\`\`\`bash
kubectl apply -f k8s/
\`\`\`

## Monitoring

${config.monitoring ? `
The model includes built-in monitoring with Prometheus metrics:

- Prediction count and latency
- Model accuracy
- System resource usage

Access Grafana dashboard at http://localhost:3000 (admin/admin)
` : 'Monitoring not configured'}

## MLOps Integration

- **Experiment Tracking**: MLflow
- **Model Registry**: MLflow Model Registry
- **Version Control**: Git + DVC (recommended)

---

Generated by ScaleSim ML Builder
`;
  }
} 