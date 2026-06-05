<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ChatLineRound, DocumentCopy, Star, StarFilled } from '@element-plus/icons-vue'
import { cancelFavoriteProduct, favoriteProduct, getFavoriteStatus, getProductDetail } from '@/api/product'
import { useCartStore } from '@/stores/cartStore'
import { useUserStore } from '@/stores/userStore'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()
const product = ref(null)
const loading = ref(false)
const favoriteLoading = ref(false)
const favorited = ref(false)

const canContact = computed(() => product.value?.status === 'ON' && product.value?.itemStatus === 'ON_SALE')
const favoriteIcon = computed(() => (favorited.value ? StarFilled : Star))

const formatPrice = value => {
  const price = Number(value)
  return Number.isFinite(price) ? price.toFixed(2) : '0.00'
}

const saveIntent = async goCart => {
  if (!canContact.value) {
    ElMessage.warning('这件闲置暂时不能交易')
    return
  }
  await cartStore.add(product.value, 1)
  ElMessage.success('已加入意向清单')
  if (goCart) {
    router.push('/cart')
  }
}

const copyTradePlace = async () => {
  const place = product.value?.tradePlace
  if (!place) {
    ElMessage.warning('暂未填写面交地点')
    return
  }
  try {
    await navigator.clipboard.writeText(place)
    ElMessage.success('已复制面交地点')
  } catch {
    ElMessage.warning('复制失败，请手动选择地点')
  }
}

const loadFavoriteStatus = async id => {
  if (!userStore.isLogin) {
    favorited.value = false
    return
  }
  try {
    const result = await getFavoriteStatus(id)
    favorited.value = Boolean(result?.favorited)
  } catch {
    favorited.value = false
  }
}

const toggleFavorite = async () => {
  if (!product.value || favoriteLoading.value) {
    return
  }
  if (!userStore.isLogin) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }

  favoriteLoading.value = true
  try {
    if (favorited.value) {
      await cancelFavoriteProduct(product.value.id)
      favorited.value = false
      product.value.favoriteCount = Math.max(Number(product.value.favoriteCount || 0) - 1, 0)
      ElMessage.success('已取消收藏')
    } else {
      await favoriteProduct(product.value.id)
      favorited.value = true
      product.value.favoriteCount = Number(product.value.favoriteCount || 0) + 1
      ElMessage.success('已收藏')
    }
  } finally {
    favoriteLoading.value = false
  }
}

const load = async id => {
  loading.value = true
  product.value = null
  favorited.value = false
  try {
    product.value = await getProductDetail(id)
    await loadFavoriteStatus(id)
  } catch {
    product.value = null
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, load, { immediate: true })
</script>

<template>
  <div class="page" v-loading="loading">
    <section v-if="product" class="detail-panel panel">
      <img :src="product.coverImage" :alt="product.name" />
      <div class="detail-info">
        <div class="tags">
          <el-tag type="success">{{ product.campus || '校内' }}</el-tag>
          <el-tag>{{ product.conditionLevel || '成色未填' }}</el-tag>
          <el-tag v-if="product.auditStatus === 'APPROVED'" type="info">已审核</el-tag>
        </div>
        <h1>{{ product.name }}</h1>
        <p>{{ product.description }}</p>
        <div class="price big">¥{{ formatPrice(product.price) }}</div>
        <div v-if="product.originalPrice" class="original">原价 ¥{{ formatPrice(product.originalPrice) }}</div>
        <dl class="trade-info">
          <div>
            <dt>交易方式</dt>
            <dd>{{ product.tradeType || '线下面交' }}</dd>
          </div>
          <div>
            <dt>面交地点</dt>
            <dd>{{ product.tradePlace || '双方协商' }}</dd>
          </div>
          <div>
            <dt>浏览</dt>
            <dd>{{ product.viewCount || 0 }} 次</dd>
          </div>
          <div>
            <dt>收藏</dt>
            <dd>{{ product.favoriteCount || 0 }} 人</dd>
          </div>
        </dl>
        <div class="notice">
          校园闲置交易建议在校内公共区域当面验货，确认成色和配件后再付款。
        </div>
        <div class="actions">
          <el-button :icon="favoriteIcon" :loading="favoriteLoading" @click="toggleFavorite">
            {{ favorited ? '取消收藏' : '收藏闲置' }}
          </el-button>
          <el-button :icon="DocumentCopy" @click="copyTradePlace">复制面交地点</el-button>
          <el-button :icon="Star" :disabled="!canContact" @click="saveIntent(false)">加入意向清单</el-button>
          <el-button type="primary" :icon="ChatLineRound" :disabled="!canContact" @click="saveIntent(true)">
            去意向清单
          </el-button>
        </div>
      </div>
    </section>
    <el-empty v-else-if="!loading" description="闲置不存在或暂未通过审核" />
  </div>
</template>

<style scoped>
.detail-panel {
  display: grid;
  grid-template-columns: 48% 1fr;
  overflow: hidden;
}

img {
  width: 100%;
  height: 520px;
  object-fit: cover;
  display: block;
}

.detail-info {
  padding: 42px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.tags,
.actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

h1 {
  margin: 0;
  font-size: 30px;
  letter-spacing: 0;
}

p {
  margin: 0;
  color: #4b5563;
  line-height: 1.8;
}

.big {
  font-size: 30px;
}

.original {
  width: fit-content;
  color: #9ca3af;
  text-decoration: line-through;
}

.trade-info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
}

.trade-info div {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f8fafc;
}

dt {
  color: #64748b;
  font-size: 13px;
}

dd {
  margin: 6px 0 0;
  color: #111827;
  font-weight: 700;
}

.notice {
  padding: 12px 14px;
  color: #475569;
  line-height: 1.6;
  background: #ecfdf5;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
}

@media (max-width: 860px) {
  .detail-panel {
    grid-template-columns: 1fr;
  }

  img {
    height: 320px;
  }
}

@media (max-width: 560px) {
  .trade-info {
    grid-template-columns: 1fr;
  }
}
</style>
