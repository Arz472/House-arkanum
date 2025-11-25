/**
 * Shared geometry and materials for performance optimization
 * Reusing geometries and materials reduces memory usage and improves performance
 */

import * as THREE from 'three';

// Singleton pattern to ensure geometries and materials are created only once
class SharedResources {
  private static instance: SharedResources;
  
  // Geometries
  public readonly boxGeometry: THREE.BoxGeometry;
  public readonly sphereGeometry: THREE.SphereGeometry;
  public readonly cylinderGeometry: THREE.CylinderGeometry;
  public readonly planeGeometry: THREE.PlaneGeometry;
  public readonly smallSphereGeometry: THREE.SphereGeometry;
  public readonly candleBodyGeometry: THREE.CylinderGeometry;
  public readonly candleWickGeometry: THREE.CylinderGeometry;
  public readonly flameOrbGeometry: THREE.SphereGeometry;
  public readonly gcOrbGeometry: THREE.SphereGeometry;
  public readonly runeGeometry: THREE.CylinderGeometry;
  
  // Materials
  public readonly stoneMaterial: THREE.MeshStandardMaterial;
  public readonly darkStoneMaterial: THREE.MeshStandardMaterial;
  public readonly floorMaterial: THREE.MeshStandardMaterial;
  public readonly wallMaterial: THREE.MeshStandardMaterial;
  public readonly ceilingMaterial: THREE.MeshStandardMaterial;
  
  private constructor() {
    // Create geometries once
    this.boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    this.sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    this.cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 16);
    this.planeGeometry = new THREE.PlaneGeometry(1, 1);
    this.smallSphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    
    // Candle-specific geometries
    this.candleBodyGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 8);
    this.candleWickGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.1, 4);
    this.flameOrbGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    
    // GC orb geometry
    this.gcOrbGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    
    // Rune geometry
    this.runeGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16);
    
    // Create materials once
    this.stoneMaterial = new THREE.MeshStandardMaterial({ 
      color: '#4a4a4a', 
      roughness: 0.8 
    });
    
    this.darkStoneMaterial = new THREE.MeshStandardMaterial({ 
      color: '#3a3a3a', 
      roughness: 0.9 
    });
    
    this.floorMaterial = new THREE.MeshStandardMaterial({ 
      color: '#2a2a3e', 
      roughness: 0.8 
    });
    
    this.wallMaterial = new THREE.MeshStandardMaterial({ 
      color: '#3a3a3a', 
      roughness: 0.9 
    });
    
    this.ceilingMaterial = new THREE.MeshStandardMaterial({ 
      color: '#2a2a2e', 
      roughness: 0.9 
    });
  }
  
  public static getInstance(): SharedResources {
    if (!SharedResources.instance) {
      SharedResources.instance = new SharedResources();
    }
    return SharedResources.instance;
  }
  
  // Cleanup method for disposing resources when no longer needed
  public dispose(): void {
    // Dispose geometries
    this.boxGeometry.dispose();
    this.sphereGeometry.dispose();
    this.cylinderGeometry.dispose();
    this.planeGeometry.dispose();
    this.smallSphereGeometry.dispose();
    this.candleBodyGeometry.dispose();
    this.candleWickGeometry.dispose();
    this.flameOrbGeometry.dispose();
    this.gcOrbGeometry.dispose();
    this.runeGeometry.dispose();
    
    // Dispose materials
    this.stoneMaterial.dispose();
    this.darkStoneMaterial.dispose();
    this.floorMaterial.dispose();
    this.wallMaterial.dispose();
    this.ceilingMaterial.dispose();
  }
}

// Export singleton instance
export const sharedResources = SharedResources.getInstance();
