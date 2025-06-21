import { StyleSheet } from 'react-native';
const transactionstyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // black background
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1.5,
    paddingTop: 20,
  },
  list: {
    paddingBottom: 120,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#FF3D5A',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardIcon: {
    marginRight: 12,
    color: '#FF3D5A',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'mono',
  },
  cardDate: {
    fontSize: 12,
    color: '#999',
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryBadge: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 10,
    color: '#FF3D5A',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#FF3D5A',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3D5A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: -2,
  },
    categoryScroll: {
    marginBottom: 12,
  },
  categoryList: {
    paddingHorizontal: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF3D5A',
    marginRight: 10,
  },
  categoryChipSelected: {
    backgroundColor: '#FF3D5A',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#FF3D5A',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#fff',
  },

});
export default transactionstyles
