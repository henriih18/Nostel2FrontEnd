import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottom: '1px solid #000',
    paddingBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  title: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
    flexGrow: 1,
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    borderBottom: '1px solid #000',
    paddingBottom: 4,
    textTransform: 'uppercase',
  },
  text: {
    fontSize: 10,
    marginBottom: 3,
    lineHeight: 1.5,
  },
  table: {
    display: 'table',
    width: 'auto',
    marginBottom: 10,
    borderStyle: 'solid',
    borderColor: '#000',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderColor: '#000',
    borderBottomColor: '#000',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f0f0f0',
    textAlign: 'center',
    padding: 5,
    fontSize: 8,
    fontWeight: 'bold',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderColor: '#000',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    fontSize: 8,
  },
  quillContent: {
    fontSize: 10,
    marginBottom: 3,
    lineHeight: 1.5,
  },
});

const ActaG = ({ formData, logoSena }) => {
  const renderQuillContent = (htmlContent) => {
    // Basic HTML to Text conversion for React-PDF
    // This is a simplified approach and might not handle complex HTML perfectly
    if (!htmlContent) return '';
    const strippedHtml = htmlContent.replace(/<[^>]+>/g, ''); // Remove HTML tags
    return strippedHtml;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.logo} src={logoSena} />
          <Text style={styles.title}>
            SERVICIO NACIONAL DE APRENDIZAJE SENA\nACTIVIDAD COMPLEMENTARIA
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ENCABEZADO DEL ACTA</Text>
          <Text style={styles.text}>ACTA No. {formData.actaNumber}</Text>
          <Text style={styles.text}>NOMBRE DEL COMITÉ O DE LA REUNIÓN: {formData.nombreComite}</Text>
          <Text style={styles.text}>CIUDAD Y FECHA: {formData.ciudad}, {formData.fecha}</Text>
          <Text style={styles.text}>HORA INICIO: {formData.horaInicio}</Text>
          <Text style={styles.text}>HORA FIN: {formData.horaFin}</Text>
          <Text style={styles.text}>LUGAR O ENLACE DE LA REUNIÓN: {formData.lugarEnlace}</Text>
          <Text style={styles.text}>DIRECCIÓN REGIONAL Y CENTRO: {formData.direccionRegionalCentro}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DESARROLLO DEL COMITÉ</Text>
          <Text style={styles.text}>AGENDA:</Text>
          <Text style={styles.quillContent}>{renderQuillContent(formData.agenda)}</Text>
          <Text style={styles.text}>OBJETIVOS:</Text>
          <Text style={styles.quillContent}>{renderQuillContent(formData.objetivos)}</Text>
          <Text style={styles.text}>DESARROLLO:</Text>
          <Text style={styles.quillContent}>{renderQuillContent(formData.desarrollo)}</Text>
          <Text style={styles.text}>CONCLUSIONES:</Text>
          <Text style={styles.quillContent}>{renderQuillContent(formData.conclusiones)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COMPROMISOS</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableColHeader}>ACTIVIDAD / DECISIÓN</Text>
              <Text style={styles.tableColHeader}>FECHA</Text>
              <Text style={styles.tableColHeader}>RESPONSABLE</Text>
              <Text style={styles.tableColHeader}>FIRMA / PARTICIPACIÓN</Text>
            </View>
            {formData.compromisos.map((compromiso, index) => (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.tableCol}>{compromiso.actividadDecision}</Text>
                <Text style={styles.tableCol}>{compromiso.fecha}</Text>
                <Text style={styles.tableCol}>{compromiso.responsable}</Text>
                <Text style={styles.tableCol}>{compromiso.firmaParticipacion}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ASISTENTES</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableColHeader}>NOMBRE COMPLETO</Text>
              <Text style={styles.tableColHeader}>NÚMERO DE DOCUMENTO</Text>
              <Text style={styles.tableColHeader}>DEPENDENCIA / EMPRESA</Text>
              <Text style={styles.tableColHeader}>FIRMA / PARTICIPACIÓN</Text>
            </View>
            {formData.asistentes.map((asistente, index) => (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.tableCol}>{asistente.nombre}</Text>
                <Text style={styles.tableCol}>{asistente.numeroDocumento}</Text>
                <Text style={styles.tableCol}>{asistente.dependenciaEmpresa}</Text>
                <Text style={styles.tableCol}>{asistente.firmaParticipacion}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ActaG;

