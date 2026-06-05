<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { cancelFavoriteProduct, getFavoriteProducts } from '@/api/product'

const router = useRouter()
const loading = ref(false)
const products = ref([])
const total = ref(0)

const query = reactive({
  page: 1,
  size: 8,
  keyword: ''
})

const formatPrice = value => {
  const price = Number(value)
  return Number.isFinite(price) ? price.toFixed(2) : '0.00'
}

const load = async () => {
  loading.value = true
  try {
    const result = await getFavoriteProducts({
      page: query.page,
      size: query.size,
      keyword: query.keyword
    })
    products.value = result.records || []
    total.value = Number(result.total || 0)
  } finally {
    loading.value = false
  }
}

const search = () => {
  query.page = 1
  load()
}

const removeFavorite = async row => {
  try {
    await ElMessageBox.confirm(`确定取消收藏「${row.name}」吗？`, '取消收藏', { type: 'warning' })
  } catch {
    return
  }
  await cancelFavoriteProduct(row.id)
  ElMessage.success('已取消收藏')
  await load()
}

onMounted(load)
</script>

<template>
  <div class="page favorites-page">
    <div class="toolbar">
      <div>
        <h2 class="section-title">我的收藏</h2>
        <p class="muted">集中查看收藏的校园闲置，方便后续联系卖家和比较价格。</p>
      </div>
      <el-button type="primary" @click="router.push('/category')">继续逛逛</el-button>
    </div>

    <section class="panel filter-panel">
      <el-input
        v-model="query.keyword"
        clearable
        placeholder="搜索收藏商品"
        class="keyword-input"
        @clear="search"
        @keyup.enter="search"
      />
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="load">刷新</el-button>
    </section>

    <section class="panel">
      <el-table v-loading="loading" :data="products" empty-text="还没有收藏闲置">
        <el-table-column label="图片" width="96">
          <template #default="{ row }">
            <el-image class="cover" :src="row.coverImage" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="闲置商品" min-width="220">
          <template #default="{ row }">
            <div class="name-cell">
              <strong>{{ row.name }}</strong>
              <span>{{ row.campus || '校内' }} · {{ row.tradePlace || '地点待沟通' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="转让价" width="120">
          <template #default="{ row }">
            <span class="price">¥{{ formatPrice(row.price) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="conditionLevel" label="成色" width="110" />
        <el-table-column label="热度" width="120">
          <template #default="{ row }">
            {{ row.viewCount || 0 }} 浏览 / {{ row.favoriteCount || 0 }} 收藏
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="发布时间" width="170" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="router.push(`/product/${row.id}`)">查看</el-button>
            <el-button text type="warning" @click="removeFavorite(row)">取消收藏</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-pagination
      class="pagination"
      background
      layout="total, prev, pager, next"
      :total="total"
      :page-size="query.size"
      v-model:current-page="query.page"
      @current-change="load"
    />
  </div>
</template>

<style scoped>
.favorites-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar p {
  margin: 4px 0 0;
}

.filter-panel {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
}

.keyword-input {
  width: 280px;
}

.cover {
  width: 64px;
  height: 52px;
  border-radius: 8px;
  background: #eef2f7;
}

.name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name-cell span {
  color: #64748b;
  font-size: 13px;
}

.pagination {
  justify-content: flex-end;
}

@media (max-width: 720px) {
  .filter-panel {
    align-items: stretch;
    flex-direction: column;
  }

  .keyword-input {
    width: 100%;
  }
}
</style>
