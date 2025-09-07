import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface OrderForPDF {
  id: string
  status: string
  totalAmount: number
  currency: string
  createdAt: string
  user: {
    id: string
    email: string
    name?: string
  }
  items: Array<{
    id: string
    quantity: number
    priceSnapshot: number
    variant: {
      product: {
        translations: Array<{
          name: string
        }>
      }
    }
  }>
  shippingAddress?: any
  billingAddress?: any
}

interface Address {
  line1?: string
  line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  street?: string
  zipCode?: string
}

export function generateDeliveryLabel(order: OrderForPDF): void {
  const doc = new jsPDF()

  // Set font
  doc.setFont('helvetica')

  // Title
  doc.setFontSize(20)
  doc.text('LABEL DE LIVRAISON', 105, 20, { align: 'center' })

  // Order info
  doc.setFontSize(12)
  doc.text(`Commande #${order.id.slice(-8)}`, 20, 40)
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('fr-FR')}`, 20, 50)
  doc.text(`Statut: ${order.status}`, 20, 60)

  // Customer info
  doc.setFontSize(14)
  doc.text('Informations client:', 20, 80)

  doc.setFontSize(12)
  doc.text(`Nom: ${order.user.name || 'N/A'}`, 20, 95)
  doc.text(`Email: ${order.user.email}`, 20, 105)

  // Shipping address (if available)
  if (order.shippingAddress) {
    try {
      const shippingAddr: Address = typeof order.shippingAddress === 'string'
        ? JSON.parse(order.shippingAddress)
        : order.shippingAddress

      doc.setFontSize(14)
      doc.text('Adresse de livraison:', 20, 125)

      doc.setFontSize(12)
      let yPos = 140

      // Street address
      if (shippingAddr.line1 || shippingAddr.street) {
        doc.text(`Rue: ${shippingAddr.line1 || shippingAddr.street}`, 20, yPos)
        yPos += 10
      }

      // Apartment/Unit
      if (shippingAddr.line2) {
        doc.text(`Appartement: ${shippingAddr.line2}`, 20, yPos)
        yPos += 10
      }

      // City
      if (shippingAddr.city) {
        doc.text(`Ville: ${shippingAddr.city}`, 20, yPos)
        yPos += 10
      }

      // Postal code
      if (shippingAddr.postal_code || shippingAddr.zipCode) {
        doc.text(`Code postal: ${shippingAddr.postal_code || shippingAddr.zipCode}`, 20, yPos)
        yPos += 10
      }

      // State/Province
      if (shippingAddr.state) {
        doc.text(`Province/État: ${shippingAddr.state}`, 20, yPos)
        yPos += 10
      }

      // Country
      if (shippingAddr.country) {
        doc.text(`Pays: ${shippingAddr.country}`, 20, yPos)
        yPos += 10
      }
    } catch (error) {
      console.error('Error parsing shipping address:', error)
    }
  }

  // Products table
  const tableData = order.items.map(item => [
    item.variant.product.translations[0]?.name || 'Produit',
    item.quantity.toString(),
    `${Number(item.priceSnapshot).toFixed(2)} ${order.currency}`,
    `${(Number(item.priceSnapshot) * item.quantity).toFixed(2)} ${order.currency}`
  ])

  // Add total row
  tableData.push([
    'TOTAL',
    '',
    '',
    `${Number(order.totalAmount).toFixed(2)} ${order.currency}`
  ])

  autoTable(doc, {
    head: [['Produit', 'Quantité', 'Prix', 'Total']],
    body: tableData,
    startY: 220,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  })

  // Footer
  const pageHeight = doc.internal.pageSize.height
  doc.setFontSize(8)
  doc.text('Merci pour votre commande!', 105, pageHeight - 20, { align: 'center' })

  // Download the PDF
  doc.save(`livraison-${order.id.slice(-8)}.pdf`)
}

export function generateCustomerInvoice(order: any, customerInfo: any) {
  const doc = new jsPDF()

  // Set font
  doc.setFont('helvetica')

  // Title
  doc.setFontSize(24)
  doc.text('FACTURE', 105, 25, { align: 'center' })

  // Company info (you can customize this)
  doc.setFontSize(12)
  doc.text('Votre Entreprise', 20, 45)
  doc.text('123 Rue Commerce', 20, 55)
  doc.text('Ville, Province, Code Postal', 20, 65)
  doc.text('Téléphone: (123) 456-7890', 20, 75)
  doc.text('Email: info@votreentreprise.com', 20, 85)

  // Invoice details
  doc.setFontSize(14)
  doc.text('Détails de la facture:', 130, 45)
  doc.setFontSize(12)
  doc.text(`Numéro: INV-${order.id.slice(-8)}`, 130, 55)
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 130, 65)
  doc.text(`Commande: #${order.id.slice(-8)}`, 130, 75)

  // Customer info
  doc.setFontSize(14)
  doc.text('Facturé à:', 20, 105)
  doc.setFontSize(12)
  doc.text(customerInfo.name || 'Client', 20, 115)
  doc.text(customerInfo.email, 20, 125)

  // Shipping address if available
  if (order.shippingAddress) {
    try {
      const shippingAddr = typeof order.shippingAddress === 'string'
        ? JSON.parse(order.shippingAddress)
        : order.shippingAddress

      doc.setFontSize(14)
      doc.text('Adresse de livraison:', 20, 145)
      doc.setFontSize(12)
      let yPos = 155

      if (shippingAddr.line1 || shippingAddr.street) {
        doc.text(shippingAddr.line1 || shippingAddr.street, 20, yPos)
        yPos += 10
      }
      if (shippingAddr.line2) {
        doc.text(shippingAddr.line2, 20, yPos)
        yPos += 10
      }
      if (shippingAddr.city) {
        doc.text(`${shippingAddr.city}, ${shippingAddr.state || ''} ${shippingAddr.postal_code || shippingAddr.zipCode || ''}`, 20, yPos)
        yPos += 10
      }
      if (shippingAddr.country) {
        doc.text(shippingAddr.country, 20, yPos)
      }
    } catch (error) {
      console.error('Error parsing shipping address for invoice:', error)
    }
  }

  // Products table
  const tableData = order.items.map((item: any) => [
    item.productSnapshot.name,
    item.quantity.toString(),
    `${Number(item.priceSnapshot).toFixed(2)} ${order.currency}`,
    `${(Number(item.priceSnapshot) * item.quantity).toFixed(2)} ${order.currency}`
  ])

  // Calculate subtotal and taxes
  const subtotal = order.items.reduce((sum: number, item: any) =>
    sum + (Number(item.priceSnapshot) * item.quantity), 0
  )

  // Basic tax calculation (you can enhance this)
  let taxRate = 0.13 // Default GST/HST
  let taxName = 'GST/HST'

  if (order.shippingAddress) {
    try {
      const addr = typeof order.shippingAddress === 'string'
        ? JSON.parse(order.shippingAddress)
        : order.shippingAddress

      if (addr.state === 'QC') {
        taxRate = 0.05 + 0.09975 // TPS + TVQ
        taxName = 'TPS/TVQ'
      }
    } catch (error) {
      console.error('Error parsing address for tax calculation:', error)
    }
  }

  const taxAmount = subtotal * taxRate
  const total = subtotal + taxAmount

  // Add summary rows
  tableData.push(
    ['', '', 'Sous-total:', `${subtotal.toFixed(2)} ${order.currency}`],
    ['', '', `${taxName} (${(taxRate * 100).toFixed(2)}%):`, `${taxAmount.toFixed(2)} ${order.currency}`],
    ['', '', 'Total:', `${total.toFixed(2)} ${order.currency}`]
  )

  autoTable(doc, {
    head: [['Article', 'Quantité', 'Prix', 'Total']],
    body: tableData,
    startY: 200,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  })

  // Footer
  const pageHeight = doc.internal.pageSize.height
  doc.setFontSize(10)
  doc.text('Merci pour votre achat!', 105, pageHeight - 30, { align: 'center' })
  doc.text('Conditions de paiement: Payé', 105, pageHeight - 20, { align: 'center' })

  // Download the PDF
  doc.save(`facture-${order.id.slice(-8)}.pdf`)
}
