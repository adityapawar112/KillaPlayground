import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveVaultProject,
  loadVaultProject,
  getVaultProjects,
  deleteVaultProject,
  saveActiveDraft,
  loadActiveDraft,
  clearActiveDraft,
} from './killaVault';

describe('Local Persistence Adapter & Project Vault', () => {
  const dummyPayload = new Uint8Array([1, 2, 3, 4, 5]);

  it('saves and loads a named project with metadata in the vault', async () => {
    const id = await saveVaultProject('Raigad Expedition', dummyPayload, {
      templateId: 'raigad',
      stats: {
        wallsCount: 4,
        foundationsCount: 2,
        stairsCount: 1,
        propsCount: 12,
        lightsCount: 6,
        foliageCount: 8,
      },
    });

    expect(id).toMatch(/^killa_/);

    const project = await loadVaultProject(id);
    expect(project).not.toBeNull();
    expect(project!.name).toBe('Raigad Expedition');
    expect(project!.templateId).toBe('raigad');
    expect(project!.stats.wallsCount).toBe(4);
    expect(project!.packageBlob).toEqual(dummyPayload);
  });

  it('lists saved projects sorted by updatedAt descending', async () => {
    await saveVaultProject('Project A', dummyPayload, { templateId: 'raigad' });
    await new Promise((r) => setTimeout(r, 10));
    await saveVaultProject('Project B', dummyPayload, { templateId: 'janjira' });

    const projects = await getVaultProjects();
    expect(projects.length).toBeGreaterThanOrEqual(2);
    // Project B was saved later, so should come first
    const idxB = projects.findIndex((p) => p.name === 'Project B');
    const idxA = projects.findIndex((p) => p.name === 'Project A');
    expect(idxB).toBeLessThan(idxA);
  });

  it('deletes a project cleanly from the vault', async () => {
    const id = await saveVaultProject('To Delete', dummyPayload, { templateId: 'sinhagad' });
    let project = await loadVaultProject(id);
    expect(project).not.toBeNull();

    await deleteVaultProject(id);
    project = await loadVaultProject(id);
    expect(project).toBeNull();
  });

  it('saves, loads, and clears the active working draft across session resets', async () => {
    const draftPayload = new Uint8Array([9, 8, 7, 6]);
    await saveActiveDraft(draftPayload);

    const loadedDraft = await loadActiveDraft();
    expect(loadedDraft).toEqual(draftPayload);

    await clearActiveDraft();
    const emptyDraft = await loadActiveDraft();
    expect(emptyDraft).toBeNull();
  });
});

