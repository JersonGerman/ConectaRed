document.addEventListener("DOMContentLoaded", () => {
  initializePublishingModule();
});

let moduleInitialized = false;
let filesToPublish = [];
let publishedMaterials = [
  {
    id: "material-1",
    title: "Guía de álgebra",
    name: "guia-algebra.pdf",
    tags: "Álgebra, Matemáticas",
    status: "Publicado hoy",
    size: 980000,
  },
  {
    id: "material-2",
    title: "Lectura comprensiva",
    name: "lectura-comprensiva.pdf",
    tags: "Lectura, Comprensión",
    status: "Publicado ayer",
    size: 760000,
  },
];

let supabaseClient = null;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  if (!window.supabase) {
    throw new Error("La librería de Supabase no está disponible.");
  }

  const supabaseUrl = window.SUPABASE_URL || "https://sviblsfhersxggcqptfh.supabase.co";
  const supabaseAnonKey = window.SUPABASE_ANON_KEY || "sb_publishable_GmUHZfbasiOBPudKKi1r9Q_f01Wycu2";
  supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

function initializePublishingModule() {
  if (moduleInitialized) return;
  moduleInitialized = true;

  const dropZone = document.getElementById("upload-drop-zone");
  const fileInput = document.getElementById("upload-file-input");
  const form = document.getElementById("publish-form");
  const modal = document.getElementById("upload-modal");
  const openModalButton = document.getElementById("open-upload-modal-btn");
  const closeModalButton = document.getElementById("upload-modal-close");
  const backdrop = modal?.querySelector("[data-close-modal]");

  renderPublishedMaterials();

  const openUploadModal = () => {
    if (!modal) return;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  const closeUploadModal = () => {
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  openModalButton?.addEventListener("click", openUploadModal);
  closeModalButton?.addEventListener("click", closeUploadModal);
  backdrop?.addEventListener("click", closeUploadModal);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeUploadModal();
    }
  });

  if (!dropZone || !fileInput || !form) return;

  dropZone.addEventListener("click", (event) => {
    if (event.target !== fileInput) {
      fileInput.click();
    }
  });

  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    window.addEventListener(eventName, (event) => event.preventDefault(), false);
    dropZone.addEventListener(eventName, (event) => event.preventDefault(), false);
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, () => {
      dropZone.style.borderColor = "#3182ce";
      dropZone.style.backgroundColor = "#ebf8ff";
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, () => {
      dropZone.style.borderColor = "#cbd5e0";
      dropZone.style.backgroundColor = "#f7fafc";
    });
  });

  dropZone.addEventListener("drop", (event) => {
    handleIncomingFiles(event.dataTransfer.files);
  });

  fileInput.addEventListener("change", (event) => {
    handleIncomingFiles(event.target.files);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await publishQueuedMaterials();
  });
}

function handleIncomingFiles(files) {
  if (!files || files.length === 0) return;

  const listContainer = document.getElementById("publishing-file-list");
  const placeholder = document.getElementById("no-files-placeholder");

  if (placeholder) {
    placeholder.remove();
  }

  Array.from(files).forEach((file) => {
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      const fileId = "file_" + Date.now() + Math.random().toString(36).slice(2, 7);
      const baseName = file.name.replace(/\.[^/.]+$/, "");

      const fileObject = {
        id: fileId,
        name: file.name,
        title: baseName,
        description: "",
        category: "",
        type: "digital",
        tags: "",
        size: file.size,
        file,
        publicUrl: null,
        storagePath: null,
      };

      filesToPublish.push(fileObject);

      const li = document.createElement("li");
      li.id = fileId;
      li.style.cssText =
        "background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 8px; position: relative;";

      li.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 6px;">
          <span style="font-size: 0.75rem; font-weight: 700; color: #e53e3e; background: #fff5f5; padding: 2px 6px; border-radius: 4px;">PDF READY</span>
          <span style="font-size: 0.75rem; color: #a0aec0; max-width: 60%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-size: 0.75rem; font-weight: 600; color: #718096;">Nombre del material:</label>
          <input type="text" value="${escapeHtml(baseName)}" class="edit-title" data-id="${fileId}" style="width: 100%; padding: 6px 10px; border: 1px solid #cbd5e0; border-radius: 6px; font-size: 0.85rem; color: #2d3748;">
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-size: 0.75rem; font-weight: 600; color: #718096;">Descripción del material:</label>
          <textarea rows="2" placeholder="Describe brevemente el contenido o propósito del recurso" class="edit-description" data-id="${fileId}" style="width: 100%; padding: 6px 10px; border: 1px solid #cbd5e0; border-radius: 6px; font-size: 0.85rem; color: #2d3748; resize: vertical;"></textarea>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-size: 0.75rem; font-weight: 600; color: #718096;">Categoría del material:</label>
          <select class="edit-category" data-id="${fileId}" style="width: 100%; padding: 6px 10px; border: 1px solid #cbd5e0; border-radius: 6px; font-size: 0.85rem; color: #2d3748; background: #fff;">
            <option value="">Selecciona una categoría</option>
            <option value="Matemáticas">Matemáticas</option>
            <option value="Lectura">Lectura</option>
            <option value="Ciencias">Ciencias</option>
            <option value="Historia">Historia</option>
            <option value="Tecnología">Tecnología</option>
            <option value="Arte">Arte</option>
          </select>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-size: 0.75rem; font-weight: 600; color: #718096;">Tipo:</label>
          <select class="edit-type" data-id="${fileId}" style="width: 100%; padding: 6px 10px; border: 1px solid #cbd5e0; border-radius: 6px; font-size: 0.85rem; color: #2d3748; background: #fff;">
            <option value="digital">Digital</option>
            <option value="fisico">Físico</option>
          </select>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-size: 0.75rem; font-weight: 600; color: #718096;">Etiquetas (separadas por comas):</label>
          <input type="text" placeholder="Ej: Algebra, Ingenieria, Ciclo1" class="edit-tags" data-id="${fileId}" style="width: 100%; padding: 6px 10px; border: 1px solid #cbd5e0; border-radius: 6px; font-size: 0.85rem; color: #2d3748;">
        </div>
        <button type="button" class="btn-remove-file" data-id="${fileId}" style="position: absolute; top: 12px; right: 12px; background: none; border: none; color: #a0aec0; cursor: pointer; font-size: 0.9rem;">✕</button>
      `;

      listContainer?.appendChild(li);

      li.querySelector(".edit-title")?.addEventListener(
        "input",
        (event) => {
          fileObject.title = event.target.value;
        },
      );
      li.querySelector(".edit-description")?.addEventListener(
        "input",
        (event) => {
          fileObject.description = event.target.value;
        },
      );
      li.querySelector(".edit-category")?.addEventListener(
        "change",
        (event) => {
          fileObject.category = event.target.value;
        },
      );
      li.querySelector(".edit-type")?.addEventListener(
        "change",
        (event) => {
          fileObject.type = event.target.value;
        },
      );
      li.querySelector(".edit-tags")?.addEventListener(
        "input",
        (event) => {
          fileObject.tags = event.target.value;
        },
      );
      li.querySelector(".btn-remove-file")?.addEventListener("click", () => {
        removeFileFromQueue(fileId);
      });
    }
  });

  updatePublishButtonState();
}

function removeFileFromQueue(id) {
  filesToPublish = filesToPublish.filter((file) => file.id !== id);
  document.getElementById(id)?.remove();

  if (filesToPublish.length === 0) {
    const listContainer = document.getElementById("publishing-file-list");
    listContainer.innerHTML = `
      <li id="no-files-placeholder" class="no-files-placeholder">
        No habéis seleccionado ningún documento aún.
      </li>
    `;
  }

  updatePublishButtonState();
}

function updatePublishButtonState() {
  const button = document.getElementById("btn-submit-all");
  if (!button) return;

  if (filesToPublish.length > 0) {
    button.disabled = false;
    button.style.backgroundColor = "#3182ce";
    button.style.cursor = "pointer";
  } else {
    button.disabled = true;
    button.style.backgroundColor = "#cbd5e0";
    button.style.cursor = "not-allowed";
  }
}

async function publishQueuedMaterials() {
  if (filesToPublish.length === 0) return;

  const submitButton = document.getElementById("btn-submit-all");
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Publicando...";
  }

  try {
    const uploadedMaterials = [];

    for (const file of filesToPublish) {
      const uploadedMaterial = await uploadMaterialToSupabase(file);
      uploadedMaterials.push({
        ...uploadedMaterial,
        status: "Publicado ahora",
      });
    }

    publishedMaterials = uploadedMaterials.concat(publishedMaterials);
    await renderPublishedMaterials();

    filesToPublish = [];
    const listContainer = document.getElementById("publishing-file-list");
    listContainer.innerHTML = `
      <li id="no-files-placeholder" class="no-files-placeholder">
        No habéis seleccionado ningún documento aún.
      </li>
    `;
    updatePublishButtonState();

    const modal = document.getElementById("upload-modal");
    modal?.classList.remove("active");
    modal?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  } catch (error) {
    console.error("Error al publicar los materiales:", error);
    window.alert(`No se pudo publicar el material: ${error.message || "Error desconocido"}`);
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Publicar Materiales Seleccionados";
      updatePublishButtonState();
    }
  }
}

async function uploadMaterialToSupabase(fileObject) {
  const supabase = getSupabaseClient();
  const sanitizedName = fileObject.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${Date.now()}_${sanitizedName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage.from("recursos").upload(storagePath, fileObject.file, {
    cacheControl: "3600",
    upsert: false,
    contentType: fileObject.file.type || "application/octet-stream",
  });

  if (uploadError) {
    throw uploadError;
  }

  const resolvedPath = uploadData?.path || storagePath;
  const { data: publicUrlData } = supabase.storage.from("recursos").getPublicUrl(resolvedPath);
  const publicUrl = publicUrlData?.publicUrl || null;

  // 1. OBTENER EL USUARIO AUTENTICADO ACTUAL
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("No se pudo obtener la sesión del usuario autenticado.");
  }

  const { error: insertError } = await supabase.from("recursos").insert({
    name: fileObject.title || fileObject.name,
    description: fileObject.description || null,
    category: fileObject.category || null,
    type: fileObject.type || "digital",
    path: publicUrl,
    image_preview: publicUrl,
    id_cuenta: user.id
  });

  if (insertError) {
    throw insertError;
  }

  return {
    ...fileObject,
    storagePath: resolvedPath,
    publicUrl,
  };
}

async function renderPublishedMaterials() {
  const list = document.getElementById("materials-list");
  if (!list) return;

  list.innerHTML = '<div class="no-files-placeholder">Cargando materiales...</div>';

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("recursos")
      .select("id, name, description, category, type, path, image_preview")
      .order("id", { ascending: false });

    if (error) {
      throw error;
    }

    const remoteMaterials = (data || []).map(mapSupabaseMaterial);
    const mergedMaterials = mergeMaterials(publishedMaterials, remoteMaterials);
    publishedMaterials = mergedMaterials;
    renderMaterialsList(mergedMaterials, list);
  } catch (error) {
    console.error("No se pudieron cargar los materiales desde Supabase:", error);
    renderMaterialsList(publishedMaterials, list);
  }
}

function renderMaterialsList(materials, list) {
  if (!list) return;

  if (!materials || materials.length === 0) {
    list.innerHTML = '<div class="no-files-placeholder">Todavía no hay materiales publicados.</div>';
    return;
  }

  list.innerHTML = materials
    .map((material) => {
      const tags = material.tags
        ? material.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
            .map((tag) => `<span class="material-tag">${escapeHtml(tag)}</span>`)
            .join("")
        : '<span class="material-tag">PDF</span>';

      const typeLabel = material.type === "fisico" ? "Físico" : "Digital";
      const categoryLabel = material.category ? `<p style="font-size: 0.8rem; color: #4a5568; margin-top: 6px;">${escapeHtml(material.category)}</p>` : "";
      const descriptionLabel = material.description ? `<p style="font-size: 0.8rem; color: #718096; margin-top: 6px;">${escapeHtml(material.description)}</p>` : "";
      const materialName = material.name || material.title || "Material sin título";
      const materialTitle = material.title || material.name || "Material sin título";

      return `
        <article class="material-card">
          <div class="material-card-icon">📄</div>
          <div>
            <h3>${escapeHtml(materialTitle)}</h3>
            <p>${escapeHtml(materialName)}</p>
            <div class="material-card-meta">
              <span>${escapeHtml(material.status || "Publicado")}</span>
              <span>${formatBytes(material.size || 0)}</span>
              <span>${escapeHtml(typeLabel)}</span>
            </div>
            ${categoryLabel}
            ${descriptionLabel}
            <div class="material-card-tags">${tags}</div>
          </div>
        </article>
      `;
    })
    .join("");
}

function mapSupabaseMaterial(record) {
  return {
    id: record.id,
    title: record.name || "Material sin título",
    name: record.name || "Material sin título",
    tags: record.category || "",
    status: "Publicado desde Supabase",
    size: 0,
    description: record.description || "",
    category: record.category || "",
    type: record.type || "digital",
    publicUrl: record.path || record.image_preview || null,
    path: record.path || null,
    image_preview: record.image_preview || null,
  };
}

function mergeMaterials(localMaterials, remoteMaterials) {
  const combined = [...(localMaterials || []), ...(remoteMaterials || [])];
  const uniqueMaterials = [];
  const seen = new Set();

  combined.forEach((material) => {
    const key = material.id || `${material.title || ""}-${material.name || ""}-${material.publicUrl || material.path || ""}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueMaterials.push(material);
    }
  });

  return uniqueMaterials;
}

function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let index = 0;

  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }

  return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

