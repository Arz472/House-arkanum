---
inclusion: fileMatch
fileMatchPattern: "**/*.tsx"
---

# Three.js & React Three Fiber Best Practices

## Memory Management

Always dispose of Three.js resources when components unmount:

```typescript
useEffect(() => {
  return () => {
    geometry.dispose();
    material.dispose();
    if (material.map) material.map.dispose();
  };
}, []);
```

## Performance Optimization

### Use Instancing for Repeated Objects
```typescript
import { Instances, Instance } from '@react-three/drei';

<Instances limit={100} geometry={sphereGeometry} material={material}>
  {items.map(item => (
    <Instance key={item.id} position={item.position} />
  ))}
</Instances>
```

### Reuse Geometries and Materials
Import from `lib/sharedGeometry.ts` instead of creating new ones:
```typescript
import { sharedGeometries, sharedMaterials } from '@/lib/sharedGeometry';
```

### Frame-Rate Independent Animation
```typescript
useFrame((state, delta) => {
  ref.current.rotation.y += speed * delta;
  ref.current.position.y += velocity * delta;
});
```

## Lighting Guidelines

- Maximum 2 lights per scene (performance requirement)
- Use ambient light for base illumination
- Use one directional light for shadows
- Prefer emissive materials over point lights for glowing effects
- Set `castShadow` and `receiveShadow` only when necessary

## Canvas Configuration

Always use these settings:
```typescript
<Canvas
  dpr={[1, 1.5]}
  camera={{ position: [x, y, z], fov: 60 }}
  shadows
>
```

## Common Patterns

### Clickable Objects
```typescript
<mesh onClick={handleClick} onPointerOver={() => setHovered(true)}>
```

### Hover Effects
```typescript
const [hovered, setHovered] = useState(false);
<mesh
  scale={hovered ? 1.1 : 1.0}
  onPointerOver={() => setHovered(true)}
  onPointerOut={() => setHovered(false)}
>
```

### Loading GLB Models
```typescript
const { scene } = useGLTF('/models/asset.glb');
return <primitive object={scene} />;
```
