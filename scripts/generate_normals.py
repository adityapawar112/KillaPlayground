import os
from PIL import Image
import numpy as np

folders = [
    'red_laterite_soil_stones_1k',
    'rocks_ground_06_1k',
    'cracked_red_ground_1k',
    'muddy_tracks_1k',
    'rocky_terrain_02_1k'
]

base_dir = 'public/textures'

for f in folders:
    tex_dir = os.path.join(base_dir, f, 'textures')
    if not os.path.isdir(tex_dir):
        continue
    disp_files = [x for x in os.listdir(tex_dir) if x.endswith('_disp_1k.png')]
    if not disp_files:
        print(f'No disp found in {f}')
        continue
    disp_path = os.path.join(tex_dir, disp_files[0])
    im = Image.open(disp_path).convert('L')
    arr = np.array(im, dtype=np.float32)
    
    # Normalize 0..1
    mn, mx = arr.min(), arr.max()
    if mx > mn:
        arr = (arr - mn) / (mx - mn)
    else:
        arr = np.zeros_like(arr)
        
    # Central difference gradient
    # OpenGL format: Tangent space X (right), Y (up), Z (out towards viewer)
    # image coords: y goes down, so dY_gl = -(y[down] - y[up])
    grad_y, grad_x = np.gradient(arr)
    
    # Normal strength factor
    strength = 6.0
    dx = -grad_x * strength
    dy = grad_y * strength  # inverted for GL up
    dz = np.ones_like(dx)
    
    length = np.sqrt(dx*dx + dy*dy + dz*dz)
    nx = (dx / length) * 0.5 + 0.5
    ny = (dy / length) * 0.5 + 0.5
    nz = (dz / length) * 0.5 + 0.5
    
    rgb = np.stack([nx, ny, nz], axis=-1)
    rgb = np.clip(rgb * 255.0, 0, 255).astype(np.uint8)
    
    out_name = disp_files[0].replace('_disp_1k.png', '_nor_gl_1k.png')
    out_path = os.path.join(tex_dir, out_name)
    Image.fromarray(rgb).save(out_path, format='PNG')
    print(f'Successfully generated: {out_path} ({rgb.shape})')
