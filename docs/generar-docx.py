"""Genera los .docx de historias de usuario y casos de prueba con las plantillas de la materia.

Fuente única: los .md de docs/. Uso (desde la raíz del repositorio):
    pip install python-docx
    python docs/generar-docx.py
"""
import copy
import re
from pathlib import Path

import docx
from docx.oxml import OxmlElement

RAIZ = Path(__file__).parent
PLANTILLAS = RAIZ / 'plantillas'


def limpiar_md(texto: str) -> str:
    """Quita el formato Markdown en línea (negritas, cursivas, código y enlaces)."""
    texto = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', texto)
    return texto.replace('**', '').replace('`', '').replace('*', '')


def poner(celda, etiqueta: str, lineas: list[str], negritas_inicio=False):
    """Reemplaza el contenido de la celda: etiqueta en negrita y luego una línea por párrafo."""
    for p in celda.paragraphs[1:]:
        p._element.getparent().remove(p._element)
    primero = celda.paragraphs[0]
    for r in primero.runs:
        r._element.getparent().remove(r._element)
    primero.add_run(etiqueta).bold = True
    for linea in lineas:
        p = celda.add_paragraph()
        if negritas_inicio and ':' in linea:
            titulo, resto = linea.split(':', 1)
            p.add_run(titulo + ':').bold = True
            p.add_run(resto)
        else:
            p.add_run(linea)


def celdas(fila):
    """Celdas únicas de una fila (las combinadas se repiten en python-docx)."""
    vistas, unicas = set(), []
    for c in fila.cells:
        if id(c._tc) not in vistas:
            vistas.add(id(c._tc))
            unicas.append(c)
    return unicas


def documento_base(plantilla: Path):
    """Abre la plantilla, conserva el título y la tabla en blanco, y borra el resto del cuerpo."""
    d = docx.Document(plantilla)
    modelo = copy.deepcopy(d.tables[0]._tbl)
    cuerpo = d.element.body
    titulo = d.paragraphs[0]._element
    for el in list(cuerpo):
        if el is not titulo and not el.tag.endswith('sectPr'):
            cuerpo.remove(el)
    return d, modelo


def agregar_tabla(d, modelo):
    tbl = copy.deepcopy(modelo)
    sect = d.element.body[-1]
    sect.addprevious(tbl)
    sect.addprevious(OxmlElement('w:p'))  # separa una tabla de la siguiente
    return docx.table.Table(tbl, d._body)


def historias():
    md = (RAIZ / 'historias-de-usuario' / 'historias-de-usuario.md').read_text(encoding='utf-8')
    d, modelo = documento_base(PLANTILLAS / 'historias-de-usuario.docx')
    bloques = re.split(r'^### ', md, flags=re.M)[1:]
    for b in bloques:
        m = re.match(r'(HU-\d+) · (.+)', b)
        if not m:
            continue
        nro, titulo = m.groups()
        prio = re.search(r'\*\*Prioridad:\*\* (\w+) · \*\*Estimación:\*\* ([\d,]+) horas', b)
        historia = re.search(r'^> (.+)$', b, flags=re.M).group(1)
        criterios = re.search(r'\*\*Criterios de aceptación\*\*\n\n(.+?)\n\n\*\*Tareas', b, flags=re.S).group(1)
        tareas = re.search(r'\*\*Tareas de implementación\*\*\n\n(.+?)(?:\n\n|\Z)', b, flags=re.S).group(1)
        t = agregar_tabla(d, modelo)
        f0 = celdas(t.rows[0])
        poner(f0[0], f'Nro: {nro}', [])
        poner(f0[1], 'Título: ', [])
        f0[1].paragraphs[0].add_run(titulo.strip())
        poner(f0[2], 'Prioridad: ', [])
        f0[2].paragraphs[0].add_run(prio.group(1) if prio else '')
        p = f0[2].add_paragraph()
        p.add_run('Estimación: ').bold = True
        p.add_run(f'{prio.group(2)} horas' if prio else '')
        poner(celdas(t.rows[1])[0], 'Historia de usuario:', [limpiar_md(historia)])
        lineas = [limpiar_md(l.lstrip('- ').strip()) for l in criterios.splitlines() if l.strip()]
        poner(celdas(t.rows[2])[0], 'Sabré que he terminado cuando se cumplan todos los criterios de aceptación:', lineas, negritas_inicio=True)
        poner(celdas(t.rows[3])[0], 'Tareas de implementación:', [limpiar_md(l.lstrip('- ').strip()) for l in tareas.splitlines() if l.strip()])
    salida = RAIZ / 'historias-de-usuario' / 'historias-de-usuario.docx'
    d.save(salida)
    print(f'{salida} ({len(bloques)} historias)')


def casos():
    md = (RAIZ / 'casos-de-prueba' / 'casos-de-prueba.md').read_text(encoding='utf-8')
    d, modelo = documento_base(PLANTILLAS / 'casos-de-prueba.docx')
    bloques = re.split(r'^### ', md, flags=re.M)[1:]
    for b in bloques:
        cid, titulo = re.match(r'(P-\d+) · (.+)', b).groups()
        campo = lambda n: re.search(rf'- \*\*{n}:\*\* (.+)', b).group(1)
        pasos = re.findall(r'^  \d+\. (.+)$', b, flags=re.M)
        fecha, responsable, estado, *obtenido = [x.strip() for x in campo('Ejecución').split(' · ')]
        t = agregar_tabla(d, modelo)
        # Una sola ejecución registrada: se quitan las filas de la segunda.
        for fila in list(t.rows)[7:]:
            fila._tr.getparent().remove(fila._tr)
        f0 = celdas(t.rows[0])
        poner(f0[0], f'ID: {cid}', [])
        poner(f0[1], 'Título: ', [])
        f0[1].paragraphs[0].add_run(f'{titulo.strip()} ({campo("HU")} · {campo("Nivel")})')
        poner(celdas(t.rows[1])[0], 'Descripción:', [limpiar_md(campo('Descripción'))])
        poner(celdas(t.rows[2])[0], 'Procedimiento de prueba:', [f'{i}. {limpiar_md(p)}' for i, p in enumerate(pasos, 1)])
        poner(celdas(t.rows[3])[0], 'Resultados esperados:', [limpiar_md(campo('Resultados esperados'))])
        f5 = celdas(t.rows[5])
        poner(f5[0], 'Fecha: ', [])
        f5[0].paragraphs[0].add_run(fecha)
        p = f5[0].add_paragraph()
        p.add_run('Responsable: ').bold = True
        p.add_run(responsable)
        poner(f5[1], 'Resultados obtenidos:', [limpiar_md(' · '.join(obtenido)) or 'Coincide con el resultado esperado.'])
        aprobado = estado.lower().startswith('aprobado')
        poner(f5[2], '', [f'Reprobado  ({" " if aprobado else "X"})', f'Aprobado ({"X" if aprobado else " "})'])
        poner(celdas(t.rows[6])[0], 'Capturas:', ['Salida de las pruebas automáticas y capturas en docs/capturas/.'])
    salida = RAIZ / 'casos-de-prueba' / 'casos-de-prueba.docx'
    d.save(salida)
    print(f'{salida} ({len(bloques)} casos)')


if __name__ == '__main__':
    historias()
    casos()
